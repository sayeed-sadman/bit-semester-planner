package ch.fhnw.bitsemesterplanner.data.repository;

import ch.fhnw.bitsemesterplanner.data.domain.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {
    List<DocumentChunk> findByDocumentUploadId(Long documentUploadId);
    List<DocumentChunk> findByDocumentUpload_Student_UserID(Long studentId);
    List<DocumentChunk> findByDocumentUploadStudentIsNull();
}
