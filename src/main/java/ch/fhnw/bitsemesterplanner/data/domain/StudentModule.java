package ch.fhnw.bitsemesterplanner.data.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_module",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "module_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentModule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long entryID;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(optional = false)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @Column(nullable = false)
    private LocalDateTime addedAt;

    @PrePersist
    public void prePersist() {
        this.addedAt = LocalDateTime.now();
    }
}
