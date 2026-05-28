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

    private static final Pattern SHORT_DESC_HEADER = Pattern.compile(
            "(?i)^[ \\t]*((?:Leading principle|Short description|Kurzbeschreibung)" +
            "(?:[ \\t]*/[ \\t]*(?:Leading principle|Short description|Kurzbeschreibung))*)[ \\t:/]*");

    private static final Pattern SECTION_HEADER_LINE = Pattern.compile(
            "(?i)^(Module content|Competencies|Prerequisites|Teaching and learning|" +
            "Literature|Remarks|Grading|Assessment)[:\\s]*$");

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
        String[] lines = text.split("\\n", -1);
        // Find the header line; keep the Matcher so we can use m.end() on the same line
        int headerLineIdx = -1;
        Matcher headerMatch = null;
        for (int i = 0; i < lines.length; i++) {
            Matcher m = SHORT_DESC_HEADER.matcher(lines[i]);
            if (m.find()) {
                headerLineIdx = i;
                headerMatch = m;
                break;
            }
        }
        if (headerLineIdx < 0) return NO_INFO;
        StringBuilder sb = new StringBuilder();
        // Capture description text that sits on the same line as the header, after m.end()
        String remainder = lines[headerLineIdx].substring(headerMatch.end())
                .replaceAll("^[ \\t/:]+", "")
                .trim();
        if (!remainder.isEmpty()) {
            sb.append(remainder);
        }
        // Continue collecting subsequent lines until a section header or 500 chars
        for (int i = headerLineIdx + 1; i < lines.length; i++) {
            String trimmed = lines[i].trim();
            if (sb.length() == 0 && trimmed.isEmpty()) continue; // skip leading blank lines only
            if (SECTION_HEADER_LINE.matcher(trimmed).find()) break; // stop before next section
            if (sb.length() > 0) sb.append(" ");
            sb.append(trimmed);
            if (sb.length() >= 500) break;
        }
        String extracted = sb.toString().trim();
        if (extracted.length() > 500) extracted = extracted.substring(0, 500).trim();
        return extracted.isEmpty() ? NO_INFO : sanitize(extracted);
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
        return NO_INFO;
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
