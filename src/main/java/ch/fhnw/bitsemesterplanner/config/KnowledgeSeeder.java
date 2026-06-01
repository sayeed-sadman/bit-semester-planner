package ch.fhnw.bitsemesterplanner.config;

import ch.fhnw.bitsemesterplanner.business.service.rag.RagService;
import ch.fhnw.bitsemesterplanner.data.domain.DocumentChunk;
import ch.fhnw.bitsemesterplanner.data.domain.DocumentUpload;
import ch.fhnw.bitsemesterplanner.data.repository.DocumentChunkRepository;
import ch.fhnw.bitsemesterplanner.data.repository.DocumentUploadRepository;
import jakarta.annotation.PostConstruct;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileInputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class KnowledgeSeeder {

    private static final int EMBED_LIMIT = 40;

    private static final Map<String, String> PROGRAMME_SECTIONS = new LinkedHashMap<>();
    static {
        PROGRAMME_SECTIONS.put("administrative", "BIT Programme - Administrative");
        PROGRAMME_SECTIONS.put("compulsory",     "BIT Programme - Compulsory Modules");
        PROGRAMME_SECTIONS.put("elective",       "BIT Programme - Elective Modules");
        PROGRAMME_SECTIONS.put("specialization", "BIT Programme - Specializations");
    }

    private final DocumentUploadRepository documentUploadRepository;
    private final DocumentChunkRepository documentChunkRepository;
    private final RagService ragService;

    public KnowledgeSeeder(DocumentUploadRepository documentUploadRepository,
                           DocumentChunkRepository documentChunkRepository,
                           RagService ragService) {
        this.documentUploadRepository = documentUploadRepository;
        this.documentChunkRepository = documentChunkRepository;
        this.ragService = ragService;
    }

    // Called live when a module PDF or programme doc is uploaded/linked
    public void indexIfNeeded(Path filePath) {
        String fileName = filePath.getFileName().toString();
        List<DocumentUpload> existing = documentUploadRepository.findAll();
        boolean alreadySeeded = existing.stream()
                .anyMatch(u -> u.getStudent() == null && fileName.equals(u.getFileName()));
        if (alreadySeeded) return;
        try {
            String rawText = extractText(filePath.toFile());
            if (rawText == null || rawText.isBlank()) return;
            String contextLabel = resolveContextLabel(filePath);
            indexFile(filePath.toFile(), rawText, contextLabel);
            System.out.println("[KnowledgeSeeder] Live-indexed [" + contextLabel + "]: " + fileName);
        } catch (Exception e) {
            System.err.println("[KnowledgeSeeder] Live-index failed for " + fileName + ": " + e.getMessage());
        }
    }

    @PostConstruct
    public void seed() {
        seedDirectory(Paths.get("docs/knowledge/module-catalog"), "Module Catalog");
        Path programmeRoot = Paths.get("docs/knowledge/programme");
        for (Map.Entry<String, String> entry : PROGRAMME_SECTIONS.entrySet()) {
            seedDirectory(programmeRoot.resolve(entry.getKey()), entry.getValue());
        }
    }

    private void seedDirectory(Path dir, String contextLabel) {
        if (!Files.exists(dir) || !Files.isDirectory(dir)) return;
        File[] files = dir.toFile().listFiles(f ->
            f.isFile() && (f.getName().toLowerCase().endsWith(".pdf")
                        || f.getName().toLowerCase().endsWith(".docx"))
        );
        if (files == null || files.length == 0) return;
        List<DocumentUpload> existing = documentUploadRepository.findAll();
        for (File file : files) {
            String fileName = file.getName();
            boolean alreadySeeded = existing.stream()
                    .anyMatch(u -> u.getStudent() == null && fileName.equals(u.getFileName()));
            if (alreadySeeded) {
                System.out.println("[KnowledgeSeeder] SKIP (already seeded): " + fileName);
                continue;
            }
            try {
                String rawText = extractText(file);
                if (rawText == null || rawText.isBlank()) {
                    System.out.println("[KnowledgeSeeder] SKIP (empty text): " + fileName);
                    continue;
                }
                indexFile(file, rawText, contextLabel);
                System.out.println("[KnowledgeSeeder] SEEDED [" + contextLabel + "]: " + fileName);
            } catch (Exception e) {
                System.err.println("[KnowledgeSeeder] FAILED [" + contextLabel + "] " + fileName + ": " + e.getMessage());
            }
        }
    }

    private void indexFile(File file, String rawText, String contextLabel) throws Exception {
        String fileName = file.getName();
        String fileType = fileName.toLowerCase().endsWith(".pdf") ? "PDF" : "DOCX";
        // Prepend section context so every chunk carries source information for RAG retrieval
        String contextualText = "[" + contextLabel + "]\nDocument: " + fileName + "\n\n" + rawText;

        DocumentUpload upload = new DocumentUpload();
        upload.setStudent(null);
        upload.setFileName(fileName);
        upload.setFileType(fileType);
        upload.setRawText(contextualText);
        upload = documentUploadRepository.save(upload);

        List<String> chunks = ragService.chunkText(contextualText);
        for (int i = 0; i < chunks.size(); i++) {
            float[] embedding = i < EMBED_LIMIT
                    ? ragService.generateEmbedding(chunks.get(i))
                    : new float[64];
            DocumentChunk chunk = new DocumentChunk();
            chunk.setDocumentUpload(upload);
            chunk.setChunkIndex(i);
            chunk.setChunkText(chunks.get(i));
            chunk.setEmbeddingJson(ragService.embeddingToJson(embedding));
            documentChunkRepository.save(chunk);
        }
    }

    private String resolveContextLabel(Path filePath) {
        String parent = filePath.getParent() != null ? filePath.getParent().getFileName().toString() : "";
        String label = PROGRAMME_SECTIONS.get(parent);
        return label != null ? label : "Module Catalog";
    }

    private String extractText(File file) throws Exception {
        String lower = file.getName().toLowerCase();
        if (lower.endsWith(".pdf")) {
            try (PDDocument doc = Loader.loadPDF(file)) {
                return new PDFTextStripper().getText(doc);
            }
        } else if (lower.endsWith(".docx")) {
            try (XWPFDocument doc = new XWPFDocument(new FileInputStream(file))) {
                StringBuilder sb = new StringBuilder();
                for (XWPFParagraph para : doc.getParagraphs()) {
                    sb.append(para.getText()).append("\n");
                }
                return sb.toString();
            }
        }
        return null;
    }
}
