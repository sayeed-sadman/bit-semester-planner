package ch.fhnw.bitsemesterplanner.business.service;

import ch.fhnw.bitsemesterplanner.business.exception.EntityNotFoundException;
import ch.fhnw.bitsemesterplanner.data.domain.Module;
import ch.fhnw.bitsemesterplanner.data.domain.Note;
import ch.fhnw.bitsemesterplanner.data.domain.User;
import ch.fhnw.bitsemesterplanner.data.repository.NoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserService userService;
    private final ModuleService moduleService;

    public NoteService(NoteRepository noteRepository, UserService userService, ModuleService moduleService) {
        this.noteRepository = noteRepository;
        this.userService = userService;
        this.moduleService = moduleService;
    }

    public Note getNoteByStudentAndModule(Long studentId, Long moduleId) {
        User student = userService.findById(studentId);
        Module module = moduleService.getModuleById(moduleId);
        return noteRepository.findByStudentAndModule(student, module).orElse(null);
    }

    @Transactional
    public Note saveNote(Long studentId, Long moduleId, String content) {
        User student = userService.findById(studentId);
        Module module = moduleService.getModuleById(moduleId);
        Note note = noteRepository.findByStudentAndModule(student, module).orElse(new Note());
        note.setStudent(student);
        note.setModule(module);
        note.setContent(content);
        return noteRepository.save(note);
    }

    @Transactional
    public void deleteNote(Long studentId, Long moduleId) {
        User student = userService.findById(studentId);
        Module module = moduleService.getModuleById(moduleId);
        Note note = noteRepository.findByStudentAndModule(student, module)
                .orElseThrow(() -> new EntityNotFoundException("Note not found for this module."));
        noteRepository.delete(note);
    }

    public List<Note> getAllNotesByStudent(Long studentId) {
        return noteRepository.findByStudentUserID(studentId);
    }
}
