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
            "Do not make assumptions or invent information.\n" +
            "Base conclusions only on available evidence.\n" +
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

    private static final String PUBLIC_CONTEXT =
            "\nPUBLIC CONTEXT:\n" +
            "You are assisting a visitor who has not logged in.\n" +
            "You can answer general questions about FHNW, the BIT programme, and the BIT Semester Planner application.\n" +
            "You do not have access to any personal data. There are no notes, calendar events, or uploaded documents available.\n" +
            "If the user asks about personal features such as notes, calendar, planner, or document upload, let them know they need to log in or register to access those features.\n" +
            "IMPORTANT: The following topics are fully in scope for public visitors and you MUST answer them directly — do NOT apply the study-only restriction to these:\n" +
            "- How to log in: click Login on the landing page and enter email and password.\n" +
            "- How to register or sign up: click Register and fill in name, email, and password. Student accounts are created via self-registration. Admin accounts are pre-provisioned and cannot be self-registered.\n" +
            "- What the app does and how to get started.\n" +
            "NEVER share, reveal, or hint at any login credentials, passwords, or email addresses for any account, including demo or test accounts. If asked, tell the user to contact their administrator.\n";

    public static final String NOTE_SUMMARY_PROMPT =
            "You are a study assistant. Your only job is to extract exam-relevant information from these document excerpts.\n" +
            "Exam-relevant means: bonus points, exam format or dates, submission deadlines, group work requirements, assessment criteria, grading details, or explicit exam tips from the professor.\n\n" +
            "CRITICAL RULES:\n" +
            "- If the document does NOT contain any of the above, return exactly: NO_STUDY_INFO_FOUND\n" +
            "- Do NOT summarize general course content, theory, concepts, or lecture topics\n" +
            "- Do NOT include historical facts, scientific principles, industry data, or case studies\n" +
            "- Do not make assumptions or invent information\n" +
            "- Base conclusions only on the provided document excerpts\n\n" +
            "If exam-relevant info IS found, format it as plain text:\n" +
            "- Start with a short header (e.g. 'Exam Info', 'Bonus Point Info', 'Assessment Details')\n" +
            "- Follow with '---'\n" +
            "- Use UPPERCASE for section headings (e.g. DEADLINES, GROUP WORK, GRADING)\n" +
            "- Use a simple dash '-' for bullet points\n" +
            "- Do NOT use markdown: no **, no ##, no __, no backticks\n" +
            "Return only the plain text note or NO_STUDY_INFO_FOUND, nothing else.";

    public static final String MODULE_DESC_PROMPT =
            "You are an academic assistant. Read the document excerpts and extract the official module description.\n" +
            "Rules:\n" +
            "- Return only the module description as a clean paragraph (2-4 sentences)\n" +
            "- Do not use bullet points, headings, or formatting\n" +
            "- Do not make assumptions or invent information\n" +
            "- Base the description only on what is explicitly stated in the document\n" +
            "- Do not include course codes, credit points, semester info, or instructor names\n" +
            "- Write in the style of an official course catalog description\n" +
            "Return only the description paragraph, nothing else.";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${ANTHROPIC_API_KEY:NOT_SET}")
    private String apiKey;

    public ChatService() {
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newHttpClient();
    }

    public Stream<String> streamChat(String userQuestion, List<DocumentChunk> contextChunks, String appContext, List<String> calendarEvents, String userRole, String userFirstName) {
        try {
            String systemPrompt = buildSystemPrompt(contextChunks, appContext, calendarEvents, userRole, userFirstName);

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
                        } catch (Exception ignored) {
                        }
                        return Stream.empty();
                    });
        } catch (Exception e) {
            throw new RuntimeException("Failed to stream chat response", e);
        }
    }

    public String generateFromChunks(List<DocumentChunk> topChunks, String systemPrompt) {
        try {
            if (topChunks == null || topChunks.isEmpty()) return null;
            StringBuilder context = new StringBuilder();
            for (DocumentChunk chunk : topChunks) {
                context.append(chunk.getChunkText()).append("\n\n");
            }
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", MODEL);
            requestBody.put("max_tokens", 512);
            requestBody.put("system", systemPrompt);
            ArrayNode messages = objectMapper.createArrayNode();
            ObjectNode userMsg = objectMapper.createObjectNode();
            userMsg.put("role", "user");
            userMsg.put("content", context.toString().trim());
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
            return null;
        }
    }

    public String chat(String userQuestion, List<DocumentChunk> contextChunks, String appContext, List<String> calendarEvents, String userRole, String userFirstName) {
        if (apiKey.equals("NOT_SET")) throw new RuntimeException("Anthropic API key not configured.");
        try {
            String systemPrompt = buildSystemPrompt(contextChunks, appContext, calendarEvents, userRole, userFirstName);

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

    private String buildSystemPrompt(List<DocumentChunk> contextChunks, String appContext, List<String> calendarEvents, String userRole, String userFirstName) {
        String dateHeader = "Today's date is " + java.time.LocalDate.now()
                + " (" + java.time.LocalDate.now().getDayOfWeek() + ").\n\n";
        StringBuilder sb = new StringBuilder(dateHeader).append(BASE_SYSTEM_PROMPT);

        if ("ADMIN".equals(userRole)) {
            sb.append(ADMIN_CONTEXT);
        } else if ("PUBLIC".equals(userRole)) {
            sb.append(PUBLIC_CONTEXT);
        } else {
            sb.append(STUDENT_CONTEXT);
        }

        if (userFirstName != null && !userFirstName.isBlank()) {
            sb.append("The student's first name is ").append(userFirstName).append(". Address them by first name when it feels natural.\n");
        }

        if (!contextChunks.isEmpty()) {
            sb.append("The following context was retrieved from the knowledge base and/or uploaded documents:\n\n");
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

        if (appContext != null && appContext.startsWith("[NOTES]")) {
            sb.append("\n\nThe following are the student's saved module notes:\n\n").append(appContext);
        } else if (appContext != null && !appContext.isBlank()) {
            sb.append("\n\n").append(appContext);
        }

        return sb.toString();
    }
}
