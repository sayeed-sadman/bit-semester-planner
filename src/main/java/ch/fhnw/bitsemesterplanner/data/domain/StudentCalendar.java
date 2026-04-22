package ch.fhnw.bitsemesterplanner.data.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "student_calendar")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentCalendar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long calendarID;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(nullable = false)
    private String displayName;

    @Column(nullable = false, length = 1000)
    private String icsURL;
}
