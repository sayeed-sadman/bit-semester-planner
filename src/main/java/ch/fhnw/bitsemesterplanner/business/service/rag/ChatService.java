package ch.fhnw.bitsemesterplanner.business.service.rag;

import ch.fhnw.bitsemesterplanner.data.domain.DocumentChunk;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.stream.Stream;

@Service
public class ChatService {

    private static final String ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-haiku-4-5-20251001";
    private static final int MAX_TOKENS = 1024;

    private static final String BASE_SYSTEM_PROMPT =
            "You are BIT Study Assistant, a professional and friendly academic assistant embedded in the BIT Semester Planner web application at FHNW.\n\n" +
            "Never use em dashes in any response.\n" +
            "Never use emojis in any response.\n" +
            "Keep responses short by default.\n" +
            "When listing multiple items, always use proper markdown bullet points with each item on its own line, like this:\n" +
            "- Item one\n" +
            "- Item two\n" +
            "- Item three\n" +
            "Never write list items inline in a paragraph.\n" +
            "Never invent module data, exam information, or deadlines.\n" +
            "If information is not found in any available source, say exactly: \"I could not find that information in my available sources.\"\n" +
            "Always indicate where your information comes from. For example: \"Based on your uploaded document...\", \"From the module catalog...\", \"From your notes...\", \"From your calendar...\"\n" +
            "Only answer questions related to FHNW, the BIT program, the semester planner app, uploaded documents, module notes, or the student calendar. For any unrelated question respond with: \"I can only help with questions related to your studies and the BIT Semester Planner.\"\n" +
            "Never save, update, or delete anything without explicit user confirmation.\n\n" +
            "ABOUT FHNW AND THE BIT PROGRAM:\n" +
            "- FHNW stands for University of Applied Sciences and Arts Northwestern Switzerland.\n" +
            "- The Bachelor of Science in Business Information Technology (BIT) is taught entirely in English.\n" +
            "- The program combines business administration and information technology.\n" +
            "- Locations: Basel and Brugg-Windisch.\n" +
            "- Full-time study: Basel only, 3 years (6 semesters), 30 ECTS per semester.\n" +
            "- Part-time study: Basel and Brugg-Windisch, 4 years (8 semesters), 21-24 ECTS per semester.\n" +
            "- Total ECTS required: 180.\n" +
            "- Study start: September each year.\n" +
            "- No prior programming or business knowledge is required.\n" +
            "- Specialisations are available in the second half of studies.\n" +
            "- Semester fee: CHF 750 for Swiss residents.\n\n" +
            "ABOUT THE BIT SEMESTER PLANNER APP:\n" +
            "- Module Catalog: Browse all official BIT modules, filter by semester and module type, view full module details.\n" +
            "- Semester Planner: Add modules to your personal plan, view planned modules on your dashboard, remove modules from your plan. Maximum 2 elective modules allowed per plan.\n" +
            "- Module Notes: Add, edit, and delete personal text notes linked to each module in your planner.\n" +
            "- Calendar Integration: Connect ICS-compatible calendars (Outlook, Google, Apple) via URL, view a weekly read-only calendar overview, detect overlapping events.\n" +
            "- Document Upload: Upload PDF or DOCX files to the chatbot. The assistant extracts study-relevant information and suggests adding it to your module notes.\n" +
            "- BIT Study Assistant: This chatbot. Helps with module questions, study planning, document analysis, and calendar queries.\n";

    private static final String STUDENT_CONTEXT =
            "\nSTUDENT CONTEXT:\n" +
            "You are assisting a BIT student.\n" +
            "You have access to the student's uploaded documents, their module notes, and their calendar events provided in the context sections below.\n" +
            "When a student uploads a document, help extract exam info, bonus points, deadlines, group tasks, and grading details.\n" +
            "You can reference the student's notes. For example: \"Based on your notes for Internet Technology...\"\n" +
            "You can reference calendar events. For example: \"You have an exam on Thursday based on your calendar.\"\n" +
            "You only have access to this student's own data. Never reference other students' data.\n" +
            "Only answer general study-related questions if the answer exists in the uploaded documents or the knowledge provided to you.\n";

    private static final String ADMIN_CONTEXT =
            "\nADMIN CONTEXT:\n" +
            "You are assisting a BIT admin.\n" +
            "You have access to all modules in the database.\n" +
            "When an admin uploads a module PDF, help identify whether the module already exists and suggest updates or new module creation.\n" +
            "You do not have access to individual student data, notes, uploads, or calendars.\n" +
            "Only answer questions about modules, the module catalog, and shared system knowledge.\n";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${anthropic.api.key}")
    private String apiKey;

    public ChatService() {
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newHttpClient();
    }

    public Stream<String> streamChat(String userQuestion, List<DocumentChunk> contextChunks, String appContext, List<String> calendarEvents, String userRole) {
        System.out.println("STREAM STARTING");
        try {
            String systemPrompt = buildSystemPrompt(contextChunks, appContext, calendarEvents, userRole);

            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", MODEL);
            requestBody.put("max_tokens", MAX_TOKENS);
            requestBody.put("system", systemPrompt);
            requestBody.put("stream", true);
            ArrayNode messages = objectMapper.createArrayNode();
            ObjectNode userMsg = objectMapper.createObjectNode();
            userMsg.put("role", "user");
            userMsg.put("content", userQuestion);
            messages.add(userMsg);
            requestBody.set("messages", messages);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(ANTHROPIC_API_URL))
                    .header("Content-Type", "application/json")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                    .build();

            HttpResponse<Stream<String>> response = httpClient.send(request, HttpResponse.BodyHandlers.ofLines());
            System.out.println("[streamChat] Anthropic HTTP status: " + response.statusCode());

            return response.body()
                    .filter(line -> line.startsWith("data: "))
                    .map(line -> line.substring(6))
                    .flatMap(data -> {
                        try {
                            JsonNode node = objectMapper.readTree(data);
                            if ("content_block_delta".equals(node.path("type").asText())) {
                                String text = node.path("delta").path("text").asText("");
                                if (!text.isEmpty()) return Stream.of(text);
                            }
                        } catch (Exception e) {
                            System.err.println("STREAM ERROR: " + e.getMessage());
                            e.printStackTrace(System.err);
                        }
                        return Stream.empty();
                    });
        } catch (Exception e) {
            System.err.println("STREAM ERROR: " + e.getMessage());
            e.printStackTrace(System.err);
            throw new RuntimeException("Failed to stream chat response", e);
        }
    }

    public String chat(String userQuestion, List<DocumentChunk> contextChunks, String appContext, List<String> calendarEvents, String userRole) {
        try {
            String systemPrompt = buildSystemPrompt(contextChunks, appContext, calendarEvents, userRole);

            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", MODEL);
            requestBody.put("max_tokens", MAX_TOKENS);
            requestBody.put("system", systemPrompt);
            ArrayNode messages = objectMapper.createArrayNode();
            ObjectNode userMsg = objectMapper.createObjectNode();
            userMsg.put("role", "user");
            userMsg.put("content", userQuestion);
            messages.add(userMsg);
            requestBody.set("messages", messages);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(ANTHROPIC_API_URL))
                    .header("Content-Type", "application/json")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode root = objectMapper.readTree(response.body());
            return root.path("content").get(0).path("text").asText();

        } catch (Exception e) {
            throw new RuntimeException("Failed to get chat response", e);
        }
    }

    private String buildSystemPrompt(List<DocumentChunk> contextChunks, String appContext, List<String> calendarEvents, String userRole) {
        String dateHeader = "Today's date is " + java.time.LocalDate.now()
                + " (" + java.time.LocalDate.now().getDayOfWeek() + ").\n\n";
        StringBuilder sb = new StringBuilder(dateHeader).append(BASE_SYSTEM_PROMPT);

        if ("ADMIN".equals(userRole)) {
            sb.append(ADMIN_CONTEXT);
        } else {
            sb.append(STUDENT_CONTEXT);
        }

        if (!contextChunks.isEmpty()) {
            sb.append("The following context was retrieved from the student's uploaded documents:\n\n");
            sb.append("[CONTEXT]\n");
            for (int i = 0; i < contextChunks.size(); i++) {
                if (i > 0) sb.append("\n\n");
                sb.append(contextChunks.get(i).getChunkText());
            }
            sb.append("\n[/CONTEXT]");
        }

        if (calendarEvents != null && !calendarEvents.isEmpty()) {
            sb.append("\n\n[CALENDAR]\n");
            sb.append(String.join("\n", calendarEvents));
            sb.append("\n[/CALENDAR]");
        }

        if (appContext != null && !appContext.isBlank()) {
            sb.append("\n\n").append(appContext);
        }

        String prompt = sb.toString();
        System.out.println("=== SYSTEM PROMPT START ===");
        System.out.println(prompt.substring(0, Math.min(200, prompt.length())));
        System.out.println("=== SYSTEM PROMPT END ===");
        return prompt;
    }
}
