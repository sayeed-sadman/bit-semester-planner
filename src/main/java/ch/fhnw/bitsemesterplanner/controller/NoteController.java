package ch.fhnw.bitsemesterplanner.controller;

import ch.fhnw.bitsemesterplanner.business.service.NoteService;
import ch.fhnw.bitsemesterplanner.business.service.UserService;
import ch.fhnw.bitsemesterplanner.data.domain.Note;
import ch.fhnw.bitsemesterplanner.data.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notes")
@Tag(name = "Notes", description = "Personal notes per module (one per student per module)")
public class NoteController {

    private final NoteService noteService;
    private final UserService userService;

    public NoteController(NoteService noteService, UserService userService) {
        this.noteService = noteService;
        this.userService = userService;
    }

    record NoteRequest(String content) {}

    @GetMapping("/{moduleId}")
    @Operation(summary = "Get the student's note for a specific module")
    @ApiResponse(responseCode = "200", description = "Note returned (null if none exists)")
    @ApiResponse(responseCode = "404", description = "Module not found")
    public ResponseEntity<Note> getNote(
            @Parameter(description = "Module ID") @PathVariable Long moduleId,
            Authentication auth) {
        User student = userService.getCurrentUser(auth);
        return ResponseEntity.ok(noteService.getNoteByStudentAndModule(student.getUserID(), moduleId));
    }

    @PostMapping("/{moduleId}")
    @Operation(summary = "Create or update the student's note for a module (upsert)")
    @ApiResponse(responseCode = "200", description = "Note saved")
    @ApiResponse(responseCode = "404", description = "Module not found")
    public ResponseEntity<Note> saveNote(
            @Parameter(description = "Module ID") @PathVariable Long moduleId,
            @RequestBody NoteRequest req,
            Authentication auth) {
        User student = userService.getCurrentUser(auth);
        return ResponseEntity.ok(noteService.saveNote(student.getUserID(), moduleId, req.content()));
    }

    @DeleteMapping("/{moduleId}")
    @Operation(summary = "Delete the student's note for a module")
    @ApiResponse(responseCode = "204", description = "Note deleted")
    @ApiResponse(responseCode = "404", description = "Note not found")
    public ResponseEntity<Void> deleteNote(
            @Parameter(description = "Module ID") @PathVariable Long moduleId,
            Authentication auth) {
        User student = userService.getCurrentUser(auth);
        noteService.deleteNote(student.getUserID(), moduleId);
        return ResponseEntity.noContent().build();
    }
}
