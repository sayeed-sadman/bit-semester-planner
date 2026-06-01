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

    private static final List<String> TITLE_SKIP_PREFIXES = List.of(
            "programme", "degree", "ects", "module type", "modultyp",
            "credits", "semester", "campus", "bachelor", "master",
            "date", "datum", "version");

    private static final Pattern SHORT_DESC_FULL = Pattern.compile(
            "(?is)(?:Leading principle|Short description|Kurzbeschreibung)[^\\n]*\\n(.*?)" +
            "(?=\\n[ \\t]*(?:Module content|Competencies to be achieved|Prerequisites|" +
            "Teaching and learning|Literature|Remarks|Grading|Assessment|Learning outcomes?" +
            "|Learning objectives?|Objectives?|Content|Workload|Contact hours?" +
            "|Module aims?|Intended learning)[ \\t]*(?:\\n|$))");

    private static final List<String> DESC_STOP_HEADERS = List.of(
            "Module content", "Competencies to be achieved", "Prerequisites",
            "Teaching and learning", "Literature", "Remarks", "Grading", "Assessment",
            "Learning outcomes", "Learning objectives", "Objectives", "Content",
            "Workload", "Contact hours", "Module aims", "Intended learning",
            "Module coordinator", "Language of instruction", "Assessment criteria");


    private static final Pattern CREDITS_INLINE = Pattern.compile(
            "(?:ECTS\\s*:?\\s*(\\d+)|(\\d+)\\s*ECTS|Credits?\\s*:?\\s*(\\d+))",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern ECTS_STANDALONE = Pattern.compile(
            "(?m)^\\s*ECTS\\s*$");

    private static final Pattern LECTURER_PATTERN_PRIMARY = Pattern.compile(
            "(?i)Lecturers?[ \\t]*:?[ \\t]+" +
            "((?:(?:Prof\\.?|Dr\\.?)[ \\t]+)*[A-Z][a-zA-Z]+(?:[ \\t]+[A-Z][a-zA-Z]+)+)");

    private static final Pattern LECTURER_PATTERN_FALLBACK = Pattern.compile(
            "(?i)(?:Module[ \\t]+coordinator|Dozent)[ \\t]*:?[ \\t]+" +
            "((?:(?:Prof\\.?|Dr\\.?)[ \\t]+)*[A-Z][a-zA-Z]+(?:[ \\t]+[A-Z][a-zA-Z]+)+)");

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}");

    private static final List<String> CAMPUS_NAMES = List.of(
            "Brugg-Windisch", "Windisch", "Basel", "Olten", "Muttenz",
            "Aarau", "Liestal", "Solothurn", "Brugg");

    // ── Public entry point ─────────────────────────────────────────────────────

    public ExtractionSuggestion extractModuleInfo(String rawText) {
        String rawLines = rawText;
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
        String moduleTitle      = extractModuleTitle(rawLines);
        String shortDescription = extractShortDescription(rawLines);
        String credits          = extractCredits(rawText);
        String lecturer         = extractLecturer(rawLines);
        String lecturerEmail    = extractLecturerEmail(rawText);
        String campus           = extractCampus(rawText);

        StringBuilder noteBuilder = new StringBuilder("Module Notes\n---\n");
        if (!NO_INFO.equals(examStyle))        noteBuilder.append("Exam Style:        ").append(examStyle).append("\n");
        if (!NO_INFO.equals(examDate))         noteBuilder.append("Exam Date:         ").append(examDate).append("\n");
        if (!NO_INFO.equals(duration))         noteBuilder.append("Duration:          ").append(duration).append("\n");
        if (!NO_INFO.equals(allowedMaterials)) noteBuilder.append("Allowed Materials: ").append(allowedMaterials).append("\n");
        if (!NO_INFO.equals(grading))          noteBuilder.append("Grading:           ").append(grading).append("\n");
        if (!NO_INFO.equals(bonusPoints) && !"None".equals(bonusPoints))
                                               noteBuilder.append("Bonus Points:      ").append(bonusPoints).append("\n");
        if (!NO_INFO.equals(deadlines))        noteBuilder.append("Deadlines:         ").append(deadlines).append("\n");
        if (!NO_INFO.equals(groupWork))        noteBuilder.append("Group Work:        ").append(groupWork).append("\n");
        if (!additionalNotes.isBlank())        noteBuilder.append("Notes:\n").append(additionalNotes).append("\n");
        String suggestedNoteText = noteBuilder.toString();

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
        if (!NO_INFO.equals(moduleTitle))      facts.add("Module Title: "      + moduleTitle);
        if (!NO_INFO.equals(shortDescription)) facts.add("Short Description: " + shortDescription);
        if (!NO_INFO.equals(credits))          facts.add("Credits: "           + credits);
        if (!NO_INFO.equals(lecturer))         facts.add("Lecturer: "          + lecturer);
        if (!NO_INFO.equals(lecturerEmail))    facts.add("Lecturer Email: "    + lecturerEmail);
        if (!NO_INFO.equals(campus))           facts.add("Campus: "            + campus);

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

    private static final List<String> GRADING_CONTEXT_KEYWORDS = List.of(
            "exam", "grade", "grading", "assignment", "project", "quiz",
            "mark", "final", "midterm", "test", "submission", "pass");

    private String extractGrading(String text) {
        Set<String> snippets = new LinkedHashSet<>();
        for (String segment : text.split("[\\n,;]+")) {
            String trimmed = segment.trim().replaceAll("\\s+", " ");
            if (PERCENTAGE.matcher(trimmed).find() || WORTH_POINTS.matcher(trimmed).find()) {
                String segLower = trimmed.toLowerCase();
                boolean looksLikeGrading = false;
                for (String kw : GRADING_CONTEXT_KEYWORDS) {
                    if (segLower.contains(kw)) { looksLikeGrading = true; break; }
                }
                if (!looksLikeGrading) continue;
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

    // ── Module metadata extractors ────────────────────────────────────────────

    private String extractModuleTitle(String text) {
        int lineCount = 0;
        for (String line : text.split("\\n")) {
            if (lineCount++ >= 20) break;
            String trimmed = line.trim().replaceAll("\\s{2,}", " ");
            if (trimmed.isEmpty()) continue;
            if (DATE_DOTTED.matcher(trimmed).find()) continue;
            if (trimmed.matches("[\\d.,/\\-]+")) continue;
            String lower = trimmed.toLowerCase();
            boolean skip = false;
            for (String prefix : TITLE_SKIP_PREFIXES) {
                if (lower.startsWith(prefix)) { skip = true; break; }
            }
            if (skip) continue;
            int wordCount = trimmed.split("\\s+").length;
            if (wordCount >= 2 && wordCount <= 6) return sanitize(trimmed);
        }
        return NO_INFO;
    }

    private String extractShortDescription(String text) {
        // Try precise regex with section-header lookahead first
        Matcher m = SHORT_DESC_FULL.matcher(text);
        if (m.find()) {
            String captured = m.group(1)
                    .replaceAll("[ \\t]+", " ")
                    .replaceAll("\\n+", " ")
                    .trim();
            if (!captured.isEmpty()) {
                if (captured.length() > 2000) captured = captured.substring(0, 2000).trim();
                return sanitize(captured);
            }
        }

        // Fallback: locate the keyword and capture from right after it
        String[] keywords = {"Short description", "Leading principle", "Kurzbeschreibung"};
        String lower = text.toLowerCase();
        for (String kw : keywords) {
            int idx = lower.indexOf(kw.toLowerCase());
            if (idx < 0) continue;
            int startPos = idx + kw.length();
            // Skip optional colon and inline whitespace immediately after the keyword
            while (startPos < text.length() && ":  \t".indexOf(text.charAt(startPos)) >= 0) {
                startPos++;
            }
            String chunk = text.substring(startPos, Math.min(text.length(), startPos + 3000));
            String chunkLower = chunk.toLowerCase();
            int stopAt = chunk.length();
            for (String stop : DESC_STOP_HEADERS) {
                // Only stop if the header appears at the start of a new line
                int si = chunkLower.indexOf("\n" + stop.toLowerCase());
                if (si >= 0 && si < stopAt) stopAt = si + 1;
            }
            String captured = chunk.substring(0, stopAt)
                    .replaceAll("[ \\t]+", " ")
                    .replaceAll("\\n+", " ")
                    .trim();
            if (!captured.isEmpty()) {
                if (captured.length() > 2000) captured = captured.substring(0, 2000).trim();
                return sanitize(captured);
            }
        }

        return NO_INFO;
    }

    private String extractCredits(String text) {
        Matcher m = CREDITS_INLINE.matcher(text);
        while (m.find()) {
            String num = m.group(1) != null ? m.group(1)
                    : m.group(2) != null ? m.group(2)
                    : m.group(3);
            if (num != null) {
                int val = Integer.parseInt(num);
                if (val >= 1 && val <= 10) return String.valueOf(val);
            }
        }
        Matcher em = ECTS_STANDALONE.matcher(text);
        if (em.find()) {
            String rest = text.substring(em.end(), Math.min(text.length(), em.end() + 20)).trim();
            Matcher numM = Pattern.compile("^(\\d+)").matcher(rest);
            if (numM.find()) {
                int val = Integer.parseInt(numM.group(1));
                if (val >= 1 && val <= 10) return String.valueOf(val);
            }
        }
        return NO_INFO;
    }

    private String extractLecturer(String text) {
        Matcher m = LECTURER_PATTERN_PRIMARY.matcher(text);
        if (m.find()) return sanitize(m.group(1).trim());
        Matcher m2 = LECTURER_PATTERN_FALLBACK.matcher(text);
        if (m2.find()) return sanitize(m2.group(1).trim());
        return NO_INFO;
    }

    private String extractLecturerEmail(String text) {
        Matcher m = EMAIL_PATTERN.matcher(text);
        if (m.find()) return sanitize(m.group());
        return NO_INFO;
    }

    private String extractCampus(String text) {
        for (String campus : CAMPUS_NAMES) {
            if (text.contains(campus)) return campus;
        }
        return "Basel";
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
