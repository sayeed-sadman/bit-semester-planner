package ch.fhnw.bitsemesterplanner.data.repository;

import ch.fhnw.bitsemesterplanner.data.domain.Module;
import ch.fhnw.bitsemesterplanner.data.domain.ModuleType;
import ch.fhnw.bitsemesterplanner.data.domain.StudentModule;
import ch.fhnw.bitsemesterplanner.data.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentModuleRepository extends JpaRepository<StudentModule, Long> {
    List<StudentModule> findByStudentUserID(Long studentId);
    Optional<StudentModule> findByStudentAndModule(User student, Module module);
    boolean existsByStudentAndModule(User student, Module module);
    long countByStudentAndModuleModuleType(User student, ModuleType moduleType);
}
