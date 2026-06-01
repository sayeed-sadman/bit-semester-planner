package ch.fhnw.bitsemesterplanner.controller;

import ch.fhnw.bitsemesterplanner.business.service.ModuleService;
import ch.fhnw.bitsemesterplanner.config.KnowledgeSeeder;
import ch.fhnw.bitsemesterplanner.data.domain.Module;
import ch.fhnw.bitsemesterplanner.data.domain.ModuleType;
import ch.fhnw.bitsemesterplanner.data.repository.DocumentUploadRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@RestController
@RequestMapping("/api/modules")
@Tag(name = "Modules", description = "BIT module catalog management")
public class ModuleController {

    private final ModuleService moduleService;
    private final KnowledgeSeeder knowledgeSeeder;
    private final DocumentUploadRepository documentUploadRepository;

    public ModuleController(ModuleService moduleService, KnowledgeSeeder knowledgeSeeder, DocumentUploadRepository documentUploadRepository) {
        this.moduleService = moduleService;
        this.knowledgeSeeder = knowledgeSeeder;
        this.documentUploadRepository = documentUploadRepository;
    }

    @GetMapping
    @Operation(summary = "Get all modules, optionally filtered by semester and/or type")
    @ApiResponse(responseCode = "200", description = "List of modules returned")
    public ResponseEntity<List<Module>> getModules(
            @Parameter(description = "Filter by semester number") @RequestParam(required = false) Integer semester,
            @Parameter(description = "Filter by module type: COMPULSORY or ELECTIVE") @RequestParam(required = false) ModuleType type) {
        return ResponseEntity.ok(moduleService.getModulesByFilter(semester, type));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single module by ID")
    @ApiResponse(responseCode = "200", description = "Module returned")
    @ApiResponse(responseCode = "404", description = "Module not found")
    public ResponseEntity<Module> getModule(
            @Parameter(description = "Module ID") @PathVariable Long id) {
        return ResponseEntity.ok(moduleService.getModuleById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new module (ADMIN only)")
    @ApiResponse(responseCode = "201", description = "Module created")
    @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required")
    public ResponseEntity<Module> createModule(@RequestBody Module module) {
        return ResponseEntity.status(HttpStatus.CREATED).body(moduleService.createModule(module));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing module (ADMIN only)")
    @ApiResponse(responseCode = "200", description = "Module updated")
    @ApiResponse(responseCode = "404", description = "Module not found")
    @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required")
    public ResponseEntity<Module> updateModule(
            @Parameter(description = "Module ID") @PathVariable Long id,
            @RequestBody Module module) {
        return ResponseEntity.ok(moduleService.updateModule(id, module));
    }

    @GetMapping("/{id}/pdf")
    @Operation(summary = "Stream the official module description PDF from docs/knowledge/")
    @ApiResponse(responseCode = "200", description = "PDF returned")
    @ApiResponse(responseCode = "404", description = "PDF not found for this module")
    public ResponseEntity<Resource> getModulePdf(
            @Parameter(description = "Module ID") @PathVariable Long id) {
        Module module = moduleService.getModuleById(id);
        Path pdfPath = Paths.get("docs/knowledge", module.getTitle() + ".pdf");
        if (!Files.exists(pdfPath)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + module.getTitle() + ".pdf\"")
                .body(new FileSystemResource(pdfPath));
    }

    @PostMapping("/{id}/pdf")
    @Operation(summary = "Upload or replace the official PDF for a module (ADMIN only)")
    @ApiResponse(responseCode = "200", description = "PDF saved")
    @ApiResponse(responseCode = "404", description = "Module not found")
    public ResponseEntity<Void> uploadModulePdf(
            @Parameter(description = "Module ID") @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            Module module = moduleService.getModuleById(id);
            Path dest = Paths.get("docs/knowledge", module.getTitle() + ".pdf");
            Files.createDirectories(dest.getParent());
            file.transferTo(dest.toFile());
            new Thread(() -> knowledgeSeeder.indexIfNeeded(dest)).start();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{id}/pdf/from-upload/{uploadId}")
    @Operation(summary = "Link an already-uploaded RAG file as this module's official PDF (ADMIN only)")
    @ApiResponse(responseCode = "200", description = "PDF linked")
    @ApiResponse(responseCode = "404", description = "Module or temp file not found")
    public ResponseEntity<Void> assignUploadAsPdf(
            @Parameter(description = "Module ID") @PathVariable Long id,
            @Parameter(description = "Upload ID from RAG upload") @PathVariable Long uploadId) {
        try {
            Module module = moduleService.getModuleById(id);
            Path temp = Paths.get("docs/knowledge/.temp", uploadId + ".pdf");
            if (!Files.exists(temp)) return ResponseEntity.notFound().build();
            Path dest = Paths.get("docs/knowledge", module.getTitle() + ".pdf");
            Files.createDirectories(dest.getParent());
            Files.copy(temp, dest, StandardCopyOption.REPLACE_EXISTING);
            Files.deleteIfExists(temp);
            documentUploadRepository.findById(uploadId).ifPresent(upload -> {
                upload.setModule(module);
                documentUploadRepository.save(upload);
            });
            new Thread(() -> knowledgeSeeder.indexIfNeeded(dest)).start();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}/pdf")
    @Operation(summary = "Delete the official PDF for a module (ADMIN only)")
    @ApiResponse(responseCode = "204", description = "PDF deleted")
    @ApiResponse(responseCode = "404", description = "PDF not found")
    public ResponseEntity<Void> deleteModulePdf(
            @Parameter(description = "Module ID") @PathVariable Long id) {
        Module module = moduleService.getModuleById(id);
        Path pdfPath = Paths.get("docs/knowledge", module.getTitle() + ".pdf");
        try {
            if (!Files.deleteIfExists(pdfPath)) return ResponseEntity.notFound().build();
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a module (ADMIN only)")
    @ApiResponse(responseCode = "204", description = "Module deleted")
    @ApiResponse(responseCode = "404", description = "Module not found")
    @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required")
    public ResponseEntity<Void> deleteModule(
            @Parameter(description = "Module ID") @PathVariable Long id) {
        moduleService.deleteModule(id);
        return ResponseEntity.noContent().build();
    }
}
