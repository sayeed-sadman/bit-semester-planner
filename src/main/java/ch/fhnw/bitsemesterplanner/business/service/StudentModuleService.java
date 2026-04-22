package ch.fhnw.bitsemesterplanner.business.service;

import ch.fhnw.bitsemesterplanner.business.exception.BusinessRuleException;
import ch.fhnw.bitsemesterplanner.business.exception.DuplicateEntryException;
import ch.fhnw.bitsemesterplanner.business.exception.EntityNotFoundException;
import ch.fhnw.bitsemesterplanner.data.domain.Module;
import ch.fhnw.bitsemesterplanner.data.domain.ModuleType;
import ch.fhnw.bitsemesterplanner.data.domain.StudentModule;
import ch.fhnw.bitsemesterplanner.data.domain.User;
import ch.fhnw.bitsemesterplanner.data.repository.NoteRepository;
import ch.fhnw.bitsemesterplanner.data.repository.StudentModuleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StudentModuleService {

    private final StudentModuleRepository studentModuleRepository;
    private final UserService userService;
    private final ModuleService moduleService;
    private final NoteRepository noteRepository;

    public StudentModuleService(StudentModuleRepository studentModuleRepository,
                                UserService userService,
                                ModuleService moduleService,
                                NoteRepository noteRepository) {
        this.studentModuleRepository = studentModuleRepository;
        this.userService = userService;
        this.moduleService = moduleService;
        this.noteRepository = noteRepository;
    }

    public List<StudentModule> getStudentModules(Long studentId) {
        return studentModuleRepository.findByStudentUserID(studentId);
    }

    @Transactional
    public StudentModule addModuleToPlanner(Long studentId, Long moduleId) {
        User student = userService.findById(studentId);
        Module module = moduleService.getModuleById(moduleId);

        // Step 1: Check if module is already in planner
        if (studentModuleRepository.existsByStudentAndModule(student, module)) {
            throw new DuplicateEntryException("This module is already in your semester plan.");
        }

        // Step 2: Check the 2-elective business rule
        if (module.getModuleType() == ModuleType.ELECTIVE) {
            long electiveCount = studentModuleRepository
                    .countByStudentAndModuleModuleType(student, ModuleType.ELECTIVE);
            if (electiveCount >= 2) {
                throw new BusinessRuleException(
                        "You have reached the maximum of 2 elective modules for your semester plan.");
            }
        }

        // Step 3: All checks pass — add the module
        StudentModule entry = new StudentModule();
        entry.setStudent(student);
        entry.setModule(module);
        return studentModuleRepository.save(entry);
    }

    @Transactional
    public void removeModuleFromPlanner(Long studentId, Long moduleId) {
        User student = userService.findById(studentId);
        Module module = moduleService.getModuleById(moduleId);
        StudentModule entry = studentModuleRepository.findByStudentAndModule(student, module)
                .orElseThrow(() -> new EntityNotFoundException("Module is not in your semester plan."));
        noteRepository.findByStudentAndModule(student, module)
                .ifPresent(noteRepository::delete);
        studentModuleRepository.delete(entry);
    }

    public boolean isModuleInPlanner(Long studentId, Long moduleId) {
        User student = userService.findById(studentId);
        Module module = moduleService.getModuleById(moduleId);
        return studentModuleRepository.existsByStudentAndModule(student, module);
    }
}
