package ch.fhnw.bitsemesterplanner.data.repository;

import ch.fhnw.bitsemesterplanner.data.domain.StudentCalendar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentCalendarRepository extends JpaRepository<StudentCalendar, Long> {
    List<StudentCalendar> findByStudentUserID(Long studentId);
}
