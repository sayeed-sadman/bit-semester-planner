package ch.fhnw.bitsemesterplanner.data.repository;

import ch.fhnw.bitsemesterplanner.data.domain.Module;
import ch.fhnw.bitsemesterplanner.data.domain.Note;
import ch.fhnw.bitsemesterplanner.data.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    Optional<Note> findByStudentAndModule(User student, Module module);
    List<Note> findByStudentUserID(Long studentId);
}
