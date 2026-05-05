package ch.fhnw.bitsemesterplanner.config;

import ch.fhnw.bitsemesterplanner.data.domain.Module;
import ch.fhnw.bitsemesterplanner.data.domain.ModuleType;
import ch.fhnw.bitsemesterplanner.data.domain.Role;
import ch.fhnw.bitsemesterplanner.data.domain.User;
import ch.fhnw.bitsemesterplanner.data.repository.ModuleRepository;
import ch.fhnw.bitsemesterplanner.data.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer {

    private final ModuleRepository moduleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(ModuleRepository moduleRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.moduleRepository = moduleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void init() {
        if (moduleRepository.count() > 0) return;

        if (!userRepository.existsByEmail("admin@fhnw.ch")) {
            User admin = new User();
            admin.setFirstName("Admin");
            admin.setLastName("FHNW");
            admin.setEmail("admin@fhnw.ch");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
        }

        saveModule("Internet Technology",
                "Introduction to web architecture, REST APIs, Spring Boot and cloud deployment",
                5, "Dr. Devid Montecchiari", "devid.montecchiari@fhnw.ch", 4, "Basel", ModuleType.COMPULSORY);

        saveModule("Software Engineering",
                "Software development lifecycle, design patterns, agile methods",
                5, "TBD", "tbd@fhnw.ch", 3, "Basel", ModuleType.COMPULSORY);

        saveModule("Project Management",
                "Planning, execution and controlling of IT projects",
                3, "TBD", "tbd@fhnw.ch", 4, "Basel", ModuleType.COMPULSORY);

        saveModule("Web Development",
                "Frontend development with HTML, CSS, JavaScript and modern frameworks",
                3, "TBD", "tbd@fhnw.ch", 3, "Windisch", ModuleType.COMPULSORY);

        saveModule("Business Intelligence",
                "Data warehousing, reporting and analytical tools for business decisions",
                5, "TBD", "tbd@fhnw.ch", 5, "Windisch", ModuleType.ELECTIVE);

        saveModule("Data Science",
                "Statistical analysis, data processing and visualization techniques",
                5, "TBD", "tbd@fhnw.ch", 5, "Basel", ModuleType.ELECTIVE);

        saveModule("Machine Learning",
                "Supervised and unsupervised learning algorithms and their applications",
                5, "TBD", "tbd@fhnw.ch", 6, "Windisch", ModuleType.ELECTIVE);

        saveModule("Digital Transformation",
                "Digitalization strategies and innovation management in enterprises",
                3, "TBD", "tbd@fhnw.ch", 6, "Basel", ModuleType.ELECTIVE);
    }

    private void saveModule(String title, String description, int credits,
                            String lecturerName, String lecturerEmail,
                            int semester, String campus, ModuleType type) {
        Module m = new Module();
        m.setTitle(title);
        m.setDescription(description);
        m.setCredits(credits);
        m.setLecturerName(lecturerName);
        m.setLecturerEmail(lecturerEmail);
        m.setSemester(semester);
        m.setCampus(campus);
        m.setModuleType(type);
        moduleRepository.save(m);
    }
}
