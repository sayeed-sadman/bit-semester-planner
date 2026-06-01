package ch.fhnw.bitsemesterplanner.data.repository;

import ch.fhnw.bitsemesterplanner.data.domain.DocumentUpload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentUploadRepository extends JpaRepository<DocumentUpload, Long> {
    List<DocumentUpload> findByStudentUserID(Long studentId);
    List<DocumentUpload> findByModuleModuleID(Long moduleId);
}
