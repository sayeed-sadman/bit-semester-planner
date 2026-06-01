package ch.fhnw.bitsemesterplanner.controller;

import ch.fhnw.bitsemesterplanner.config.KnowledgeSeeder;
import ch.fhnw.bitsemesterplanner.data.domain.DocumentUpload;
import ch.fhnw.bitsemesterplanner.data.repository.DocumentChunkRepository;
import ch.fhnw.bitsemesterplanner.data.repository.DocumentUploadRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/api/programme-docs")
@Tag(name = "Programme Docs", description = "BIT programme reference documents (electives, specializations, etc.)")
public class ProgrammeDocController {

    private static final Path PROGRAMME_ROOT = Paths.get("docs/knowledge/programme");

    private static final List<String> SECTION_ORDER = List.of(
            "administrative", "compulsory", "elective", "specialization"
    );
    private static final Map<String, String> SECTION_LABELS = Map.of(
            "administrative", "Administrative",
            "compulsory",     "Compulsory Modules",
            "elective",       "Elective Modules",
            "specialization", "Specializations"
    );

    private final KnowledgeSeeder knowledgeSeeder;
    private final DocumentUploadRepository documentUploadRepository;
    private final DocumentChunkRepository documentChunkRepository;

    public ProgrammeDocController(KnowledgeSeeder knowledgeSeeder,
                                  DocumentUploadRepository documentUploadRepository,
                                  DocumentChunkRepository documentChunkRepository) {
        this.knowledgeSeeder = knowledgeSeeder;
        this.documentUploadRepository = documentUploadRepository;
        this.documentChunkRepository = documentChunkRepository;
    }

    record SectionDto(String section, String displayName, List<String> files) {}

    @GetMapping
    @Operation(summary = "List all programme documents grouped by section (public)")
    public ResponseEntity<List<SectionDto>> listDocs() {
        List<SectionDto> result = new ArrayList<>();
        for (String section : SECTION_ORDER) {
            Path dir = PROGRAMME_ROOT.resolve(section);
            List<String> files = new ArrayList<>();
            if (Files.exists(dir) && Files.isDirectory(dir)) {
                File[] found = dir.toFile().listFiles(f ->
                    f.isFile() && (f.getName().toLowerCase().endsWith(".pdf")
                                || f.getName().toLowerCase().endsWith(".docx"))
                );
                if (found != null) {
                    Arrays.sort(found, Comparator.comparing(File::getName));
                    for (File f : found) files.add(f.getName());
                }
            }
            result.add(new SectionDto(section, SECTION_LABELS.getOrDefault(section, section), files));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{section}/{filename}")
    @Operation(summary = "Serve a programme document file (public)")
    public ResponseEntity<Resource> getFile(
            @PathVariable String section,
            @PathVariable String filename) {
        if (!SECTION_ORDER.contains(section)) return ResponseEntity.badRequest().build();
        Path filePath = PROGRAMME_ROOT.resolve(section).resolve(filename);
        if (!Files.exists(filePath)) return ResponseEntity.notFound().build();
        MediaType mediaType = filename.toLowerCase().endsWith(".pdf")
                ? MediaType.APPLICATION_PDF
                : MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(new FileSystemResource(filePath));
    }

    @PostMapping("/{section}")
    @Operation(summary = "Upload a new programme document (Admin only)")
    public ResponseEntity<Void> uploadDoc(
            @PathVariable String section,
            @RequestParam("file") MultipartFile file) {
        if (!SECTION_ORDER.contains(section)) return ResponseEntity.badRequest().build();
        try {
            Path dir = PROGRAMME_ROOT.resolve(section);
            Files.createDirectories(dir);
            String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload";
            Path dest = dir.resolve(fileName);
            file.transferTo(dest.toFile());
            new Thread(() -> knowledgeSeeder.indexIfNeeded(dest)).start();
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{section}/{filename}")
    @Operation(summary = "Delete a programme document (Admin only)")
    public ResponseEntity<Void> deleteDoc(
            @PathVariable String section,
            @PathVariable String filename) {
        if (!SECTION_ORDER.contains(section)) return ResponseEntity.badRequest().build();
        Path filePath = PROGRAMME_ROOT.resolve(section).resolve(filename);
        try {
            if (!Files.deleteIfExists(filePath)) return ResponseEntity.notFound().build();
            documentUploadRepository.findAll().stream()
                    .filter(u -> u.getStudent() == null && filename.equals(u.getFileName()))
                    .findFirst()
                    .ifPresent(upload -> {
                        documentChunkRepository.deleteAll(
                            documentChunkRepository.findByDocumentUploadId(upload.getId()));
                        documentUploadRepository.delete(upload);
                    });
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
