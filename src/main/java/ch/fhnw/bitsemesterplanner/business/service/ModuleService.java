package ch.fhnw.bitsemesterplanner.business.service;

import ch.fhnw.bitsemesterplanner.business.exception.EntityNotFoundException;
import ch.fhnw.bitsemesterplanner.data.domain.Module;
import ch.fhnw.bitsemesterplanner.data.domain.ModuleType;
import ch.fhnw.bitsemesterplanner.data.repository.DocumentUploadRepository;
import ch.fhnw.bitsemesterplanner.data.repository.ModuleRepository;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

@Service
public class ModuleService {

    private final ModuleRepository moduleRepository;
    private final DocumentUploadRepository documentUploadRepository;

    public ModuleService(ModuleRepository moduleRepository, DocumentUploadRepository documentUploadRepository) {
        this.moduleRepository = moduleRepository;
        this.documentUploadRepository = documentUploadRepository;
    }

    public List<Module> getAllModules() {
        return moduleRepository.findAllByOrderByTitleAsc();
    }

    public Module getModuleById(Long id) {
        return moduleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Module not found with ID: " + id));
    }

    public List<Module> getModulesByFilter(Integer semester, ModuleType moduleType) {
        if (semester != null && moduleType != null) {
            return moduleRepository.findBySemesterAndModuleTypeOrderByTitleAsc(semester, moduleType);
        } else if (semester != null) {
            return moduleRepository.findBySemesterOrderByTitleAsc(semester);
        } else if (moduleType != null) {
            return moduleRepository.findByModuleTypeOrderByTitleAsc(moduleType);
        }
        return moduleRepository.findAllByOrderByTitleAsc();
    }

    public Module createModule(Module module) {
        return moduleRepository.save(module);
    }

    public Module updateModule(Long id, Module updatedModule) {
        Module existing = getModuleById(id);
        existing.setTitle(updatedModule.getTitle());
        existing.setDescription(updatedModule.getDescription());
        existing.setCredits(updatedModule.getCredits());
        existing.setLecturerName(updatedModule.getLecturerName());
        existing.setLecturerEmail(updatedModule.getLecturerEmail());
        existing.setSemester(updatedModule.getSemester());
        existing.setCampus(updatedModule.getCampus());
        existing.setModuleType(updatedModule.getModuleType());
        return moduleRepository.save(existing);
    }

    public void deleteModule(Long id) {
        getModuleById(id);
        documentUploadRepository.findByModuleModuleID(id).forEach(upload -> {
            try { Files.deleteIfExists(Paths.get("docs/knowledge/.temp", upload.getId() + ".pdf")); } catch (Exception ignored) {}
        });
        moduleRepository.deleteById(id);
    }
}
