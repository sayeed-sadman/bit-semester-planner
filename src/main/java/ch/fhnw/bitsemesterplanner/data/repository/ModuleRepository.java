package ch.fhnw.bitsemesterplanner.data.repository;

import ch.fhnw.bitsemesterplanner.data.domain.Module;
import ch.fhnw.bitsemesterplanner.data.domain.ModuleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {
    List<Module> findAllByOrderByTitleAsc();
    List<Module> findBySemesterOrderByTitleAsc(Integer semester);
    List<Module> findByModuleTypeOrderByTitleAsc(ModuleType moduleType);
    List<Module> findBySemesterAndModuleTypeOrderByTitleAsc(Integer semester, ModuleType moduleType);
}
