package ch.fhnw.bitsemesterplanner.controller;

import ch.fhnw.bitsemesterplanner.business.service.UserService;
import ch.fhnw.bitsemesterplanner.data.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User registration and profile management")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    record RegisterRequest(String firstName, String lastName, String email, String password) {}
    record UpdateProfileRequest(String firstName, String lastName, String email, String password) {}

    @PostMapping("/register")
    @Operation(summary = "Register a new student account")
    @ApiResponse(responseCode = "201", description = "Student registered successfully")
    @ApiResponse(responseCode = "409", description = "Email already in use")
    public ResponseEntity<User> register(@RequestBody RegisterRequest req) {
        User user = userService.registerStudent(req.firstName(), req.lastName(), req.email(), req.password());
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current logged-in user information")
    @ApiResponse(responseCode = "200", description = "Current user returned")
    @ApiResponse(responseCode = "401", description = "Not authenticated")
    public ResponseEntity<User> getMe(Authentication auth) {
        return ResponseEntity.ok(userService.getCurrentUser(auth));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    @ApiResponse(responseCode = "200", description = "Profile updated successfully")
    @ApiResponse(responseCode = "401", description = "Not authenticated")
    @ApiResponse(responseCode = "409", description = "Email already in use")
    public ResponseEntity<User> updateMe(Authentication auth, @RequestBody UpdateProfileRequest req) {
        User current = userService.getCurrentUser(auth);
        User updated = userService.updateProfile(
                current.getUserID(), req.firstName(), req.lastName(), req.email(), req.password());
        return ResponseEntity.ok(updated);
    }
}
