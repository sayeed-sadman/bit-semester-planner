package ch.fhnw.bitsemesterplanner.business.service;

import ch.fhnw.bitsemesterplanner.business.exception.EntityNotFoundException;
import ch.fhnw.bitsemesterplanner.data.domain.Module;
import ch.fhnw.bitsemesterplanner.data.domain.ModuleType;
import ch.fhnw.bitsemesterplanner.data.repository.ModuleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ModuleService {

    private final ModuleRepository moduleRepository;

    public ModuleService(ModuleRepository moduleRepository) {
        this.moduleRepository = moduleRepository;
    }

    public List<Module> getAllModules() {
        return moduleRepository.findAll();
    }

    public Module getModuleById(Long id) {
        return moduleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Module not found with ID: " + id));
    }

    public List<Module> getModulesByFilter(Integer semester, ModuleType moduleType) {
        if (semester != null && moduleType != null) {
            return moduleRepository.findBySemesterAndModuleType(semester, moduleType);
        } else if (semester != null) {
            return moduleRepository.findBySemester(semester);
        } else if (moduleType != null) {
            return moduleRepository.findByModuleType(moduleType);
        }
        return moduleRepository.findAll();
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
        moduleRepository.deleteById(id);
    }
}
