package ch.fhnw.bitsemesterplanner.controller;

import ch.fhnw.bitsemesterplanner.business.exception.BusinessRuleException;
import ch.fhnw.bitsemesterplanner.business.exception.EntityNotFoundException;
import ch.fhnw.bitsemesterplanner.business.service.ModuleService;
import ch.fhnw.bitsemesterplanner.business.service.UserService;
import ch.fhnw.bitsemesterplanner.business.service.rag.ExtractionService;
import ch.fhnw.bitsemesterplanner.business.service.rag.ExtractionSuggestion;
import ch.fhnw.bitsemesterplanner.business.service.rag.RagService;
import ch.fhnw.bitsemesterplanner.data.domain.DocumentChunk;
import ch.fhnw.bitsemesterplanner.data.domain.DocumentUpload;
import ch.fhnw.bitsemesterplanner.data.domain.Module;
import ch.fhnw.bitsemesterplanner.data.domain.Role;
import ch.fhnw.bitsemesterplanner.data.domain.User;
import ch.fhnw.bitsemesterplanner.data.repository.DocumentChunkRepository;
import ch.fhnw.bitsemesterplanner.data.repository.DocumentUploadRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/rag")
@Tag(name = "Document RAG", description = "Upload documents and retrieve AI-powered study suggestions")
public class DocumentController {

    private final DocumentUploadRepository documentUploadRepository;
    private final DocumentChunkRepository documentChunkRepository;
    private final RagService ragService;
    private final ExtractionService extractionService;
    private final UserService userService;
    private final ModuleService moduleService;

    public DocumentController(DocumentUploadRepository documentUploadRepository,
                               DocumentChunkRepository documentChunkRepository,
                               RagService ragService,
                               ExtractionService extractionService,
                               UserService userService,
                               ModuleService moduleService) {
        this.documentUploadRepository = documentUploadRepository;
        this.documentChunkRepository = documentChunkRepository;
        this.ragService = ragService;
        this.extractionService = extractionService;
        this.userService = userService;
        this.moduleService = moduleService;
    }

    record DocumentUploadResponse(Long uploadId, String fileName, int chunkCount, ExtractionSuggestion suggestions, String userRole) {}
    record ModuleMatchResponse(boolean matched, Module module, int matchScore) {}

    @PostMapping("/upload")
    @Operation(summary = "Upload a PDF or DOCX document, extract text, embed chunks, and return study suggestions")
    @ApiResponse(responseCode = "201", description = "Document uploaded and processed")
    @ApiResponse(responseCode = "400", description = "Unsupported file type or extraction error")
    public ResponseEntity<DocumentUploadResponse> uploadDocument(
            @Parameter(description = "PDF or DOCX file") @RequestParam("file") MultipartFile file,
            @Parameter(description = "Optional module ID to associate this upload with") @RequestParam(value = "moduleId", required = false) String moduleId,
            Authentication auth) {

        User student = userService.getCurrentUser(auth);

        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload";
        String rawText = extractText(file, fileName);
        String fileType = resolveFileType(fileName);

        DocumentUpload upload = new DocumentUpload();
        upload.setStudent(student);
        upload.setFileName(fileName);
        upload.setFileType(fileType);
        upload.setRawText(rawText);
        upload = documentUploadRepository.save(upload);

        List<String> chunks = ragService.chunkText(rawText);
        for (int i = 0; i < chunks.size(); i++) {
            float[] embedding = ragService.generateEmbedding(chunks.get(i));
            DocumentChunk chunk = new DocumentChunk();
            chunk.setDocumentUpload(upload);
            chunk.setChunkIndex(i);
            chunk.setChunkText(chunks.get(i));
            chunk.setEmbeddingJson(ragService.embeddingToJson(embedding));
            documentChunkRepository.save(chunk);
        }

        ExtractionSuggestion suggestions = extractionService.extractModuleInfo(rawText);
        String userRole = student.getRole().name();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new DocumentUploadResponse(upload.getId(), fileName, chunks.size(), suggestions, userRole));
    }

    @GetMapping("/uploads")
    @Operation(summary = "List all documents uploaded by the authenticated student")
    @ApiResponse(responseCode = "200", description = "Upload list returned")
    public ResponseEntity<List<DocumentUpload>> getUploads(Authentication auth) {
        User student = userService.getCurrentUser(auth);
        // embeddingJson lives on DocumentChunk, not DocumentUpload — not included in this response
        return ResponseEntity.ok(documentUploadRepository.findByStudentUserID(student.getUserID()));
    }

    @DeleteMapping("/uploads/{id}")
    @Operation(summary = "Delete an uploaded document and all its chunks")
    @ApiResponse(responseCode = "204", description = "Document deleted")
    @ApiResponse(responseCode = "403", description = "Upload belongs to a different student")
    @ApiResponse(responseCode = "404", description = "Upload not found")
    public ResponseEntity<Void> deleteUpload(
            @Parameter(description = "Upload ID") @PathVariable Long id,
            Authentication auth) {
        User student = userService.getCurrentUser(auth);
        DocumentUpload upload = documentUploadRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Upload not found with ID: " + id));
        if (!upload.getStudent().getUserID().equals(student.getUserID())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        documentChunkRepository.deleteAll(documentChunkRepository.findByDocumentUploadId(id));
        documentUploadRepository.delete(upload);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/match-module")
    @Operation(summary = "Find best-matching module for an extracted document title (ADMIN only)")
    @ApiResponse(responseCode = "200", description = "Match result returned")
    @ApiResponse(responseCode = "403", description = "ADMIN role required")
    public ResponseEntity<ModuleMatchResponse> matchModule(
            @Parameter(description = "Title extracted from uploaded document") @RequestParam("title") String title,
            Authentication auth) {
        User user = userService.getCurrentUser(auth);
        if (user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Module> allModules = moduleService.getModulesByFilter(null, null);
        String[] words = title.toLowerCase().split("[\\s\\-_.,]+");

        Module bestMatch = null;
        int bestScore = 0;

        for (Module module : allModules) {
            String moduleTitle = module.getTitle().toLowerCase();
            int score = 0;
            for (String word : words) {
                if (word.length() > 2 && moduleTitle.contains(word)) {
                    score++;
                }
            }
            if (score > bestScore) {
                bestScore = score;
                bestMatch = module;
            }
        }

        boolean matched = bestScore > 0;
        return ResponseEntity.ok(new ModuleMatchResponse(matched, matched ? bestMatch : null, bestScore));
    }

    // --- helpers ---

    private String extractText(MultipartFile file, String fileName) {
        String lower = fileName.toLowerCase();
        try {
            if (lower.endsWith(".pdf")) {
                try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
                    return new PDFTextStripper().getText(doc);
                }
            } else if (lower.endsWith(".docx") || lower.endsWith(".doc")) {
                try (XWPFDocument doc = new XWPFDocument(file.getInputStream())) {
                    StringBuilder sb = new StringBuilder();
                    for (XWPFParagraph para : doc.getParagraphs()) {
                        sb.append(para.getText()).append("\n");
                    }
                    return sb.toString();
                }
            } else {
                throw new BusinessRuleException("Unsupported file type. Only PDF and DOCX files are accepted.");
            }
        } catch (BusinessRuleException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessRuleException("Failed to extract text from file: " + e.getMessage());
        }
    }

    private String resolveFileType(String fileName) {
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".pdf")) return "PDF";
        if (lower.endsWith(".docx") || lower.endsWith(".doc")) return "DOCX";
        return "UNKNOWN";
    }
}
