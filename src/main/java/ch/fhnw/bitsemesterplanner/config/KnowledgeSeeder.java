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
import java.util.List;

@Component
public class KnowledgeSeeder {

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

    @PostConstruct
    public void seed() {
        Path knowledgeDir = Paths.get("docs/knowledge");
        if (!Files.exists(knowledgeDir) || !Files.isDirectory(knowledgeDir)) {
            return;
        }

        File[] files = knowledgeDir.toFile().listFiles(f ->
            f.isFile() && (f.getName().toLowerCase().endsWith(".pdf")
                        || f.getName().toLowerCase().endsWith(".docx"))
        );
        if (files == null || files.length == 0) return;

        List<DocumentUpload> existingUploads = documentUploadRepository.findAll();

        for (File file : files) {
            String fileName = file.getName();

            boolean alreadySeeded = existingUploads.stream()
                    .anyMatch(u -> u.getStudent() == null && fileName.equals(u.getFileName()));
            if (alreadySeeded) {
                System.out.println("KNOWLEDGE SKIP (already seeded): " + fileName);
                continue;
            }

            try {
                String rawText = extractText(file);
                if (rawText == null || rawText.isBlank()) {
                    System.out.println("KNOWLEDGE SKIP (empty text): " + fileName);
                    continue;
                }

                String fileType = fileName.toLowerCase().endsWith(".pdf") ? "PDF" : "DOCX";

                DocumentUpload upload = new DocumentUpload();
                upload.setStudent(null);
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

                System.out.println("SEEDED: " + fileName);
            } catch (Exception e) {
                System.err.println("KNOWLEDGE SEED FAILED for " + fileName + ": " + e.getMessage());
                e.printStackTrace(System.err);
            }
        }
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
