package ch.fhnw.bitsemesterplanner.controller;

import ch.fhnw.bitsemesterplanner.business.service.StudentModuleService;
import ch.fhnw.bitsemesterplanner.business.service.UserService;
import ch.fhnw.bitsemesterplanner.data.domain.StudentModule;
import ch.fhnw.bitsemesterplanner.data.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/planner")
@Tag(name = "Planner", description = "Student semester plan management")
public class StudentModuleController {

    private final StudentModuleService studentModuleService;
    private final UserService userService;

    public StudentModuleController(StudentModuleService studentModuleService, UserService userService) {
        this.studentModuleService = studentModuleService;
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Get all modules in the current student's semester plan")
    @ApiResponse(responseCode = "200", description = "List of planned modules returned")
    @ApiResponse(responseCode = "401", description = "Not authenticated")
    public ResponseEntity<List<StudentModule>> getPlanner(Authentication auth) {
        User student = userService.getCurrentUser(auth);
        return ResponseEntity.ok(studentModuleService.getStudentModules(student.getUserID()));
    }

    @PostMapping("/{moduleId}")
    @Operation(summary = "Add a module to the student's semester plan")
    @ApiResponse(responseCode = "201", description = "Module added to plan")
    @ApiResponse(responseCode = "400", description = "Business rule violation: maximum 2 elective modules allowed")
    @ApiResponse(responseCode = "404", description = "Module not found")
    @ApiResponse(responseCode = "409", description = "Module already in plan")
    public ResponseEntity<StudentModule> addToPlanner(
            @Parameter(description = "ID of the module to add") @PathVariable Long moduleId,
            Authentication auth) {
        User student = userService.getCurrentUser(auth);
        StudentModule entry = studentModuleService.addModuleToPlanner(student.getUserID(), moduleId);
        return ResponseEntity.status(HttpStatus.CREATED).body(entry);
    }

    @DeleteMapping("/{moduleId}")
    @Operation(summary = "Remove a module from the student's semester plan")
    @ApiResponse(responseCode = "204", description = "Module removed from plan")
    @ApiResponse(responseCode = "404", description = "Module not in plan")
    public ResponseEntity<Void> removeFromPlanner(
            @Parameter(description = "ID of the module to remove") @PathVariable Long moduleId,
            Authentication auth) {
        User student = userService.getCurrentUser(auth);
        studentModuleService.removeModuleFromPlanner(student.getUserID(), moduleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{moduleId}/status")
    @Operation(summary = "Check if a module is already in the student's semester plan")
    @ApiResponse(responseCode = "200", description = "Status check returned")
    public ResponseEntity<Map<String, Boolean>> checkStatus(
            @Parameter(description = "ID of the module to check") @PathVariable Long moduleId,
            Authentication auth) {
        User student = userService.getCurrentUser(auth);
        boolean inPlan = studentModuleService.isModuleInPlanner(student.getUserID(), moduleId);
        return ResponseEntity.ok(Map.of("inPlanner", inPlan));
    }
}
