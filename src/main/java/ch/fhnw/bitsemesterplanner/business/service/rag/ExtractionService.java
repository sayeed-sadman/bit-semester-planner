package ch.fhnw.bitsemesterplanner.business.service.rag;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ExtractionService {

    private static final String NO_INFO = "No info found";

    private static final List<String> EXAM_STYLE_KEYWORDS = List.of(
            "written exam", "oral exam", "multiple choice", "open book",
            "closed book", "online exam", "take-home", "iPad exam"
    );

    private static final List<String> MATERIAL_KEYWORDS = List.of(
            "cheat sheet", "open book", "closed book", "calculator",
            "TI-30", "formula sheet", "notes allowed", "no aids"
    );

    private static final List<String> BONUS_KEYWORDS = List.of(
            "bonus", "extra credit", "Bonuspunkte", "additional points"
    );

    private static final List<String> DEADLINE_KEYWORDS = List.of(
            "due", "deadline", "submit by", "abgabe", "DoS"
    );

    private static final List<String> GROUP_KEYWORDS = List.of(
            "group", "team", "pairs", "individual", "Gruppenarbeit"
    );

    private static final List<String> NOTE_KEYWORDS = List.of(
            "important", "note", "remember", "attention", "focus"
    );

    private static final Pattern DATE_DOTTED =
            Pattern.compile("\\d{1,2}\\.\\d{1,2}\\.\\d{2,4}");

    private static final Pattern DATE_MONTH_NAME = Pattern.compile(
            "\\d{1,2}\\s+(January|February|March|April|May|June|July|August" +
            "|September|October|November|December)\\s+\\d{4}" +
            "|(January|February|March|April|May|June|July|August" +
            "|September|October|November|December)\\s+\\d{1,2},?\\s+\\d{4}",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern DURATION_PATTERN =
            Pattern.compile("\\d+\\s*(minutes?|hours?|min)", Pattern.CASE_INSENSITIVE);

    private static final Pattern PERCENTAGE =
            Pattern.compile("\\d+\\s*%", Pattern.CASE_INSENSITIVE);

    private static final Pattern WORTH_POINTS =
            Pattern.compile("worth\\s+\\d+\\s+points", Pattern.CASE_INSENSITIVE);

    // ── Public entry point ─────────────────────────────────────────────────────

    public ExtractionSuggestion extractModuleInfo(String rawText) {
        rawText = sanitize(rawText);
        String examStyle        = extractExamStyle(rawText);
        String examDate         = extractExamDate(rawText);
        String duration         = extractDuration(rawText);
        String allowedMaterials = extractAllowedMaterials(rawText);
        String grading          = extractGrading(rawText);
        String bonusPoints      = extractBonusPoints(rawText);
        String deadlines        = extractDeadlines(rawText);
        String groupWork        = extractGroupWork(rawText);
        String additionalNotes  = extractAdditionalNotes(rawText);

        String suggestedNoteText =
                "Module Notes\n" +
                "---\n" +
                "Exam Style:        " + examStyle        + "\n" +
                "Exam Date:         " + examDate         + "\n" +
                "Duration:          " + duration         + "\n" +
                "Allowed Materials: " + allowedMaterials + "\n" +
                "---\n" +
                "Grading:           " + grading          + "\n" +
                "Bonus Points:      " + bonusPoints      + "\n" +
                "Deadlines:         " + deadlines        + "\n" +
                "Group Work:        " + groupWork        + "\n" +
                "---\n" +
                "Notes:\n" + additionalNotes;

        List<String> facts = new ArrayList<>();
        if (!NO_INFO.equals(examStyle))        facts.add("Exam Style: "        + examStyle);
        if (!NO_INFO.equals(examDate))         facts.add("Exam Date: "         + examDate);
        if (!NO_INFO.equals(duration))         facts.add("Duration: "          + duration);
        if (!NO_INFO.equals(allowedMaterials)) facts.add("Allowed Materials: " + allowedMaterials);
        if (!NO_INFO.equals(grading))          facts.add("Grading: "           + grading);
        if (!NO_INFO.equals(bonusPoints))      facts.add("Bonus Points: "      + bonusPoints);
        if (!NO_INFO.equals(deadlines))        facts.add("Deadlines: "         + deadlines);
        if (!NO_INFO.equals(groupWork))        facts.add("Group Work: "        + groupWork);
        if (!additionalNotes.isBlank())        facts.add("Notes: "             + additionalNotes);

        return new ExtractionSuggestion(facts, suggestedNoteText);
    }

    // ── Extraction helpers ─────────────────────────────────────────────────────

    private String extractExamStyle(String text) {
        List<String> found = new ArrayList<>();
        String lower = text.toLowerCase();
        for (String kw : EXAM_STYLE_KEYWORDS) {
            if (lower.contains(kw.toLowerCase())) {
                found.add(Character.toUpperCase(kw.charAt(0)) + kw.substring(1));
            }
        }
        return found.isEmpty() ? NO_INFO : sanitize(String.join(", ", found));
    }

    private String extractExamDate(String text) {
        Matcher m = DATE_DOTTED.matcher(text);
        if (m.find()) return sanitize(m.group());
        Matcher m2 = DATE_MONTH_NAME.matcher(text);
        if (m2.find()) return sanitize(m2.group().trim());
        return NO_INFO;
    }

    private String extractDuration(String text) {
        Matcher m = DURATION_PATTERN.matcher(text);
        if (m.find()) return sanitize(m.group().trim());
        return NO_INFO;
    }

    private String extractAllowedMaterials(String text) {
        List<String> found = new ArrayList<>();
        String lower = text.toLowerCase();
        for (String kw : MATERIAL_KEYWORDS) {
            if (lower.contains(kw.toLowerCase())) {
                found.add(kw);
            }
        }
        return found.isEmpty() ? NO_INFO : sanitize(String.join(", ", found));
    }

    private String extractGrading(String text) {
        Set<String> snippets = new LinkedHashSet<>();
        for (String segment : text.split("[\\n,;]+")) {
            String trimmed = segment.trim().replaceAll("\\s+", " ");
            if (PERCENTAGE.matcher(trimmed).find() || WORTH_POINTS.matcher(trimmed).find()) {
                snippets.add(trimmed.length() > 60 ? trimmed.substring(0, 57) + "…" : trimmed);
                if (snippets.size() >= 5) break;
            }
        }
        return snippets.isEmpty() ? NO_INFO : sanitize(String.join("; ", snippets));
    }

    private String extractBonusPoints(String text) {
        String lower = text.toLowerCase();
        if (lower.contains("no bonus") || lower.contains("keine bonuspunkte")) return "None";
        if (!containsAny(lower, BONUS_KEYWORDS)) return NO_INFO;
        String ctx = contextAround(text, BONUS_KEYWORDS, 0, 80);
        return ctx != null ? sanitize(ctx) : NO_INFO;
    }

    private String extractDeadlines(String text) {
        Set<String> snippets = new LinkedHashSet<>();
        String lower = text.toLowerCase();
        for (String kw : DEADLINE_KEYWORDS) {
            int idx = lower.indexOf(kw.toLowerCase());
            while (idx >= 0 && snippets.size() < 3) {
                int start = Math.max(0, idx - 10);
                int end   = Math.min(text.length(), idx + kw.length() + 50);
                String snippet = text.substring(start, end)
                        .replaceAll("[\\n\\r\\t]+", " ")
                        .replaceAll("\\s{2,}", " ")
                        .trim();
                snippets.add(snippet);
                idx = lower.indexOf(kw.toLowerCase(), idx + 1);
            }
        }
        return snippets.isEmpty() ? NO_INFO : sanitize(String.join("; ", snippets));
    }

    private String extractGroupWork(String text) {
        String ctx = contextAround(text, GROUP_KEYWORDS, 0, 60);
        return ctx != null ? sanitize(ctx) : NO_INFO;
    }

    private static final Pattern NOISE_SENTENCE = Pattern.compile(
            "\\d+\\s+Internet Technology|Devid|Montecchiari|slide\\s+\\d+|page\\s+\\d+|^\\s*\\d+\\s",
            Pattern.CASE_INSENSITIVE);

    private String extractAdditionalNotes(String text) {
        List<String> found = new ArrayList<>();
        for (String sentence : text.split("[.!?]+")) {
            String trimmed = sentence.trim()
                    .replaceAll("[\\n\\r\\t]+", " ")
                    .replaceAll("\\s{2,}", " ");
            if (trimmed.length() < 20) continue;
            if (NOISE_SENTENCE.matcher(trimmed).find()) continue;
            String lower = trimmed.toLowerCase();
            for (String kw : NOTE_KEYWORDS) {
                if (lower.contains(kw)) {
                    found.add(sanitize(trimmed));
                    break;
                }
            }
            if (found.size() >= 2) break;
        }
        return String.join("\n", found);
    }

    // ── Shared utilities ───────────────────────────────────────────────────────

    private String sanitize(String value) {
        if (value == null) return NO_INFO;
        return value
                .replaceAll("[^\\x20-\\x7E\\xA0-\\xFF]", " ")
                .replaceAll(" {2,}", " ")
                .trim();
    }

    private boolean containsAny(String lowerText, List<String> keywords) {
        for (String kw : keywords) {
            if (lowerText.contains(kw.toLowerCase())) return true;
        }
        return false;
    }

    private String contextAround(String text, List<String> keywords, int before, int after) {
        String lower = text.toLowerCase();
        for (String kw : keywords) {
            int idx = lower.indexOf(kw.toLowerCase());
            if (idx >= 0) {
                int start = Math.max(0, idx - before);
                int end   = Math.min(text.length(), idx + kw.length() + after);
                return text.substring(start, end)
                        .replaceAll("[\\n\\r\\t]+", " ")
                        .replaceAll("\\s{2,}", " ")
                        .trim();
            }
        }
        return null;
    }
}
