package ch.fhnw.bitsemesterplanner.business.service;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class CalendarEventDTO {
    private String title;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private String calendarName;
    private boolean isOverlapping;
}
