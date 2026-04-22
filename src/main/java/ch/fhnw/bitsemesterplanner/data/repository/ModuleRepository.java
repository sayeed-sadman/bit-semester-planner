package ch.fhnw.bitsemesterplanner.data.repository;

import ch.fhnw.bitsemesterplanner.data.domain.Module;
import ch.fhnw.bitsemesterplanner.data.domain.ModuleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {
    List<Module> findBySemester(Integer semester);
    List<Module> findByModuleType(ModuleType moduleType);
    List<Module> findBySemesterAndModuleType(Integer semester, ModuleType moduleType);
}
