package ch.fhnw.bitsemesterplanner.controller;

import ch.fhnw.bitsemesterplanner.business.service.CalendarEventDTO;
import ch.fhnw.bitsemesterplanner.business.service.CalendarService;
import ch.fhnw.bitsemesterplanner.business.service.rag.ChatService;
import ch.fhnw.bitsemesterplanner.business.service.rag.RagService;
import ch.fhnw.bitsemesterplanner.controller.dto.ChatRequest;
import ch.fhnw.bitsemesterplanner.controller.dto.ChatResponse;
import ch.fhnw.bitsemesterplanner.data.domain.DocumentChunk;
import ch.fhnw.bitsemesterplanner.data.domain.Note;
import ch.fhnw.bitsemesterplanner.data.repository.DocumentChunkRepository;
import ch.fhnw.bitsemesterplanner.data.repository.NoteRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/chat")
@Tag(name = "Chat", description = "RAG-powered study assistant — ask questions about uploaded documents")
public class ChatController {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    private final ChatService chatService;
    private final RagService ragService;
    private final DocumentChunkRepository documentChunkRepository;
    private final CalendarService calendarService;
    private final NoteRepository noteRepository;

    public ChatController(ChatService chatService,
                          RagService ragService,
                          DocumentChunkRepository documentChunkRepository,
                          CalendarService calendarService,
                          NoteRepository noteRepository) {
        this.chatService = chatService;
        this.ragService = ragService;
        this.documentChunkRepository = documentChunkRepository;
        this.calendarService = calendarService;
        this.noteRepository = noteRepository;
    }

    @PostMapping
    @Operation(summary = "Ask a question; optionally scoped to a student's uploaded documents")
    @ApiResponse(responseCode = "200", description = "Answer returned")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest req, Authentication authentication) {
        String userRole = "PUBLIC";
        if (authentication != null && authentication.isAuthenticated()) {
            userRole = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(a -> a.startsWith("ROLE_"))
                    .map(a -> a.substring(5))
                    .findFirst()
                    .orElse("STUDENT");
        }
        List<DocumentChunk> topChunks = List.of();
        List<String> calendarEvents = List.of();

        List<DocumentChunk> candidateChunks = new ArrayList<>(
                documentChunkRepository.findByDocumentUploadStudentIsNull());

        String notesContext = "";
        if (req.userId() != null) {
            candidateChunks.addAll(documentChunkRepository
                    .findByDocumentUpload_Student_UserID(req.userId()));
            try {
                java.time.LocalDate today = java.time.LocalDate.now();
                List<CalendarEventDTO> events = calendarService.fetchAllEvents(req.userId());
                List<String> eventStrings = new ArrayList<>(events.size());
                for (CalendarEventDTO e : events) {
                    if (!e.getStartDateTime().toLocalDate().isBefore(today)) {
                        eventStrings.add(String.format(
                            "EVENT: %s | Date: %s | Time: %s - %s | Calendar: %s",
                            e.getTitle(),
                            e.getStartDateTime().format(DATE_FMT),
                            e.getStartDateTime().format(TIME_FMT),
                            e.getEndDateTime().format(TIME_FMT),
                            e.getCalendarName()
                        ));
                    }
                }
                calendarEvents = eventStrings;
            } catch (Exception ignored) {
                // calendar fetch failure must not break chat
            }
            notesContext = buildNotesContext(req.userId());
        }

        if (!candidateChunks.isEmpty()) {
            topChunks = ragService.retrieveTopChunks(req.question(), candidateChunks, 10);
        }

        String answer = chatService.chat(req.question(), topChunks, notesContext, calendarEvents, userRole, req.userFirstName());
        return ResponseEntity.ok(new ChatResponse(answer, topChunks.size()));
    }

    @PostMapping("/stream")
    @Operation(summary = "Stream a chat response chunk by chunk via SSE")
    @ApiResponse(responseCode = "200", description = "SSE stream of text chunks")
    public SseEmitter streamChat(@RequestBody ChatRequest req, Authentication authentication) {
        try {
            String userRole = "PUBLIC";
            if (authentication != null && authentication.isAuthenticated()) {
                userRole = authentication.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .filter(a -> a.startsWith("ROLE_"))
                        .map(a -> a.substring(5))
                        .findFirst()
                        .orElse("STUDENT");
            }
            List<DocumentChunk> topChunks = List.of();
            List<String> calendarEvents = List.of();

            List<DocumentChunk> candidateChunks = new ArrayList<>(
                    documentChunkRepository.findByDocumentUploadStudentIsNull());

            String notesContext = "";
            if (req.userId() != null) {
                candidateChunks.addAll(documentChunkRepository
                        .findByDocumentUpload_Student_UserID(req.userId()));
                try {
                    java.time.LocalDate today = java.time.LocalDate.now();
                    List<CalendarEventDTO> events = calendarService.fetchAllEvents(req.userId());
                    List<String> eventStrings = new ArrayList<>(events.size());
                    for (CalendarEventDTO e : events) {
                        if (!e.getStartDateTime().toLocalDate().isBefore(today)) {
                            eventStrings.add(String.format(
                                "EVENT: %s | Date: %s | Time: %s - %s | Calendar: %s",
                                e.getTitle(),
                                e.getStartDateTime().format(DATE_FMT),
                                e.getStartDateTime().format(TIME_FMT),
                                e.getEndDateTime().format(TIME_FMT),
                                e.getCalendarName()
                            ));
                        }
                    }
                    calendarEvents = eventStrings;
                } catch (Exception ignored) {
                    // calendar fetch failure must not break chat
                }
                notesContext = buildNotesContext(req.userId());
            }

            if (!candidateChunks.isEmpty()) {
                topChunks = ragService.retrieveTopChunks(req.question(), candidateChunks, 10);
            }

            SseEmitter emitter = new SseEmitter(120_000L);
            final List<DocumentChunk> finalTopChunks = topChunks;
            final List<String> finalCalendarEvents = calendarEvents;
            final String finalUserRole = userRole;
            final String finalNotesContext = notesContext;

            final String finalUserFirstName = req.userFirstName();
            new Thread(() -> {
                try (Stream<String> chunks = chatService.streamChat(
                        req.question(), finalTopChunks, finalNotesContext, finalCalendarEvents, finalUserRole, finalUserFirstName)) {
                    chunks.forEach(chunk -> {
                        try {
                            emitter.send(SseEmitter.event().data(chunk.replace("\n", "\\n")));
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                    });
                    emitter.complete();
                } catch (Exception e) {
                    emitter.completeWithError(e);
                }
            }).start();

            return emitter;
        } catch (Exception e) {
            throw e;
        }
    }

    private String buildNotesContext(Long userId) {
        try {
            List<Note> notes = noteRepository.findByStudentUserID(userId);
            if (notes.isEmpty()) return "";
            StringBuilder sb = new StringBuilder("[NOTES]\n");
            for (Note note : notes) {
                sb.append("Module: ").append(note.getModule().getTitle()).append("\n");
                sb.append(note.getContent()).append("\n\n");
            }
            sb.append("[/NOTES]");
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }
}
