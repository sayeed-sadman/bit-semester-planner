package ch.fhnw.bitsemesterplanner.business.service;

import ch.fhnw.bitsemesterplanner.business.exception.EntityNotFoundException;
import ch.fhnw.bitsemesterplanner.data.domain.StudentCalendar;
import ch.fhnw.bitsemesterplanner.data.domain.User;
import ch.fhnw.bitsemesterplanner.data.repository.StudentCalendarRepository;
import net.fortuna.ical4j.data.CalendarBuilder;
import net.fortuna.ical4j.model.Calendar;
import net.fortuna.ical4j.model.Component;
import net.fortuna.ical4j.model.Property;
import net.fortuna.ical4j.model.component.VEvent;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Service
public class CalendarService {

    private final StudentCalendarRepository studentCalendarRepository;
    private final UserService userService;

    public CalendarService(StudentCalendarRepository studentCalendarRepository, UserService userService) {
        this.studentCalendarRepository = studentCalendarRepository;
        this.userService = userService;
    }

    public List<StudentCalendar> getCalendarsByStudent(Long studentId) {
        return studentCalendarRepository.findByStudentUserID(studentId);
    }

    public StudentCalendar addCalendar(Long studentId, String displayName, String icsURL) {
        User student = userService.findById(studentId);
        StudentCalendar cal = new StudentCalendar();
        cal.setStudent(student);
        cal.setDisplayName(displayName);
        cal.setIcsURL(icsURL);
        return studentCalendarRepository.save(cal);
    }

    public void deleteCalendar(Long calendarId, Long studentId) {
        StudentCalendar cal = studentCalendarRepository.findById(calendarId)
                .orElseThrow(() -> new EntityNotFoundException("Calendar not found with ID: " + calendarId));
        if (!cal.getStudent().getUserID().equals(studentId)) {
            throw new EntityNotFoundException("Calendar not found with ID: " + calendarId);
        }
        studentCalendarRepository.delete(cal);
    }

    @SuppressWarnings("unchecked")
    public List<CalendarEventDTO> fetchEvents(String icsURL, String calendarName) {
        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(icsURL))
                    .GET()
                    .build();
            HttpResponse<InputStream> response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());

            CalendarBuilder builder = new CalendarBuilder();
            Calendar calendar = builder.build(response.body());

            LocalDate today = LocalDate.now();
            LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate weekEnd = weekStart.plusDays(6);

            List<CalendarEventDTO> events = new ArrayList<>();
            List<VEvent> vEvents = calendar.getComponents(Component.VEVENT);
            for (VEvent event : vEvents) {
                String title = event.getProperty(Property.SUMMARY)
                        .map(Property::getValue).orElse("(No Title)");

                LocalDateTime start = parseIcsDate(event.getProperty(Property.DTSTART)
                        .map(Property::getValue).orElse(null));
                LocalDateTime end = parseIcsDate(event.getProperty(Property.DTEND)
                        .map(Property::getValue).orElse(null));

                if (start == null) continue;
                if (end == null) end = start.plusHours(1);

                LocalDate eventDate = start.toLocalDate();
                if (!eventDate.isBefore(weekStart) && !eventDate.isAfter(weekEnd)) {
                    events.add(new CalendarEventDTO(title, start, end, calendarName, false));
                }
            }
            return events;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch calendar events: " + e.getMessage(), e);
        }
    }

    public List<CalendarEventDTO> fetchAllEvents(Long studentId) {
        List<StudentCalendar> calendars = getCalendarsByStudent(studentId);
        List<CalendarEventDTO> allEvents = new ArrayList<>();

        for (StudentCalendar cal : calendars) {
            try {
                allEvents.addAll(fetchEvents(cal.getIcsURL(), cal.getDisplayName()));
            } catch (Exception ignored) {
            }
        }

        // Mark overlapping events
        for (int i = 0; i < allEvents.size(); i++) {
            for (int j = i + 1; j < allEvents.size(); j++) {
                CalendarEventDTO a = allEvents.get(i);
                CalendarEventDTO b = allEvents.get(j);
                if (a.getStartDateTime().isBefore(b.getEndDateTime()) &&
                        b.getStartDateTime().isBefore(a.getEndDateTime())) {
                    a.setOverlapping(true);
                    b.setOverlapping(true);
                }
            }
        }

        return allEvents;
    }

    private LocalDateTime parseIcsDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            String cleaned = dateStr.replace("Z", "").replace("z", "");
            if (cleaned.length() >= 15 && cleaned.charAt(8) == 'T') {
                int year  = Integer.parseInt(cleaned.substring(0, 4));
                int month = Integer.parseInt(cleaned.substring(4, 6));
                int day   = Integer.parseInt(cleaned.substring(6, 8));
                int hour  = Integer.parseInt(cleaned.substring(9, 11));
                int min   = Integer.parseInt(cleaned.substring(11, 13));
                int sec   = cleaned.length() >= 15 ? Integer.parseInt(cleaned.substring(13, 15)) : 0;
                return LocalDateTime.of(year, month, day, hour, min, sec);
            } else if (cleaned.length() >= 8) {
                int year  = Integer.parseInt(cleaned.substring(0, 4));
                int month = Integer.parseInt(cleaned.substring(4, 6));
                int day   = Integer.parseInt(cleaned.substring(6, 8));
                return LocalDateTime.of(year, month, day, 0, 0, 0);
            }
        } catch (Exception ignored) {
        }
        return null;
    }
}
