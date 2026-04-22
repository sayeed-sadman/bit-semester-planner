package ch.fhnw.bitsemesterplanner.controller;

import ch.fhnw.bitsemesterplanner.business.service.ModuleService;
import ch.fhnw.bitsemesterplanner.data.domain.Module;
import ch.fhnw.bitsemesterplanner.data.domain.ModuleType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modules")
@Tag(name = "Modules", description = "BIT module catalog management")
public class ModuleController {

    private final ModuleService moduleService;

    public ModuleController(ModuleService moduleService) {
        this.moduleService = moduleService;
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
