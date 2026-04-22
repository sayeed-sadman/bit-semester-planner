package ch.fhnw.bitsemesterplanner.controller;

import ch.fhnw.bitsemesterplanner.business.exception.EntityNotFoundException;
import ch.fhnw.bitsemesterplanner.business.service.CalendarEventDTO;
import ch.fhnw.bitsemesterplanner.business.service.CalendarService;
import ch.fhnw.bitsemesterplanner.business.service.UserService;
import ch.fhnw.bitsemesterplanner.data.domain.StudentCalendar;
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

@RestController
@RequestMapping("/api/calendars")
@Tag(name = "Calendars", description = "ICS calendar connections and weekly event view")
public class CalendarController {

    private final CalendarService calendarService;
    private final UserService userService;

    public CalendarController(CalendarService calendarService, UserService userService) {
        this.calendarService = calendarService;
        this.userService = userService;
    }

    record AddCalendarRequest(String displayName, String icsURL) {}

    @GetMapping
    @Operation(summary = "Get all connected calendars for the current student")
    @ApiResponse(responseCode = "200", description = "List of calendars returned")
    public ResponseEntity<List<StudentCalendar>> getCalendars(Authentication auth) {
        User student = userService.getCurrentUser(auth);
        return ResponseEntity.ok(calendarService.getCalendarsByStudent(student.getUserID()));
    }

    @PostMapping
    @Operation(summary = "Add a new ICS calendar connection")
    @ApiResponse(responseCode = "201", description = "Calendar connection added")
    public ResponseEntity<StudentCalendar> addCalendar(
            @RequestBody AddCalendarRequest req, Authentication auth) {
        User student = userService.getCurrentUser(auth);
        StudentCalendar saved = calendarService.addCalendar(
                student.getUserID(), req.displayName(), req.icsURL());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove a calendar connection")
    @ApiResponse(responseCode = "204", description = "Calendar removed")
    @ApiResponse(responseCode = "404", description = "Calendar not found")
    public ResponseEntity<Void> deleteCalendar(
            @Parameter(description = "Calendar ID") @PathVariable Long id,
            Authentication auth) {
        User student = userService.getCurrentUser(auth);
        calendarService.deleteCalendar(id, student.getUserID());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/events")
    @Operation(summary = "Fetch events from a single calendar for the current week")
    @ApiResponse(responseCode = "200", description = "Events returned")
    @ApiResponse(responseCode = "404", description = "Calendar not found")
    public ResponseEntity<List<CalendarEventDTO>> getEvents(
            @Parameter(description = "Calendar ID") @PathVariable Long id,
            Authentication auth) {
        User student = userService.getCurrentUser(auth);
        StudentCalendar cal = calendarService.getCalendarsByStudent(student.getUserID()).stream()
                .filter(c -> c.getCalendarID().equals(id))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Calendar not found with ID: " + id));
        return ResponseEntity.ok(calendarService.fetchEvents(cal.getIcsURL(), cal.getDisplayName()));
    }

    @GetMapping("/events/all")
    @Operation(summary = "Fetch events from all connected calendars for the current week, with overlap detection")
    @ApiResponse(responseCode = "200", description = "Merged events with overlap flags returned")
    public ResponseEntity<List<CalendarEventDTO>> getAllEvents(Authentication auth) {
        User student = userService.getCurrentUser(auth);
        return ResponseEntity.ok(calendarService.fetchAllEvents(student.getUserID()));
    }
}
