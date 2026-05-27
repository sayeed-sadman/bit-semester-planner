package ch.fhnw.bitsemesterplanner.business.service.rag;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExtractionSuggestion {
    private List<String> detectedFacts;
    private String suggestedNoteText;
}
