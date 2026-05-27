package ch.fhnw.bitsemesterplanner.business.service.rag;

import ch.fhnw.bitsemesterplanner.data.domain.DocumentChunk;
import ch.fhnw.bitsemesterplanner.data.repository.DocumentChunkRepository;
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
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class RagService {

    private static final String ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-haiku-4-5-20251001";
    private static final String EMBEDDING_SYSTEM_PROMPT =
            "You are an embedding generator. Respond ONLY with a JSON array of 64 floats between -1 and 1 " +
            "that semantically represent the input text. No explanation, no markdown, just the raw JSON array.";

    private static final int CHUNK_SIZE = 400;
    private static final int CHUNK_OVERLAP = 50;

    private final DocumentChunkRepository documentChunkRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${anthropic.api.key}")
    private String apiKey;

    public RagService(DocumentChunkRepository documentChunkRepository) {
        this.documentChunkRepository = documentChunkRepository;
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newHttpClient();
    }

    public List<String> chunkText(String rawText) {
        String[] words = rawText.trim().split("\\s+");
        List<String> chunks = new ArrayList<>();
        int step = CHUNK_SIZE - CHUNK_OVERLAP;
        for (int i = 0; i < words.length; i += step) {
            int end = Math.min(i + CHUNK_SIZE, words.length);
            chunks.add(String.join(" ", List.of(words).subList(i, end)));
            if (end == words.length) break;
        }
        return chunks;
    }

    public float[] generateEmbedding(String text) {
        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", MODEL);
            requestBody.put("max_tokens", 512);
            requestBody.put("system", EMBEDDING_SYSTEM_PROMPT);
            ArrayNode messages = objectMapper.createArrayNode();
            ObjectNode userMsg = objectMapper.createObjectNode();
            userMsg.put("role", "user");
            userMsg.put("content", text);
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
            String embeddingText = root.path("content").get(0).path("text").asText().strip();
            // Strip markdown code fences that Claude occasionally wraps around the array
            if (embeddingText.startsWith("```")) {
                embeddingText = embeddingText.replaceAll("^```(?:json)?\\s*", "").replaceAll("\\s*```$", "").strip();
            }
            JsonNode arrayNode = objectMapper.readTree(embeddingText);

            float[] result = new float[arrayNode.size()];
            for (int i = 0; i < arrayNode.size(); i++) {
                result[i] = (float) arrayNode.get(i).asDouble();
            }
            return result;

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate embedding", e);
        }
    }

    public String embeddingToJson(float[] embedding) {
        try {
            return objectMapper.writeValueAsString(embedding);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize embedding", e);
        }
    }

    public float[] jsonToEmbedding(String json) {
        try {
            return objectMapper.readValue(json, float[].class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to deserialize embedding", e);
        }
    }

    public double cosineSimilarity(float[] a, float[] b) {
        double dot = 0.0, normA = 0.0, normB = 0.0;
        int len = Math.min(a.length, b.length);
        for (int i = 0; i < len; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        if (normA == 0.0 || normB == 0.0) return 0.0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    public List<DocumentChunk> retrieveTopChunks(String question, List<DocumentChunk> allChunks, int topK) {
        float[] questionEmbedding = generateEmbedding(question);
        return allChunks.stream()
                .filter(chunk -> chunk.getEmbeddingJson() != null)
                .sorted(Comparator.comparingDouble(
                        (DocumentChunk chunk) -> cosineSimilarity(questionEmbedding, jsonToEmbedding(chunk.getEmbeddingJson()))
                ).reversed())
                .limit(topK)
                .toList();
    }
}
