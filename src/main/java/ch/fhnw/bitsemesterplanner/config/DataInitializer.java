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
        if (!userRepository.existsByEmail("admin@fhnw.ch")) {
            User admin = new User();
            admin.setFirstName("Admin");
            admin.setLastName("FHNW");
            admin.setEmail("admin@fhnw.ch");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
        }

        if (!userRepository.existsByEmail("student@fhnw.ch")) {
            User student = new User();
            student.setFirstName("Demo");
            student.setLastName("Student");
            student.setEmail("student@fhnw.ch");
            student.setPassword(passwordEncoder.encode("student123"));
            student.setRole(Role.STUDENT);
            userRepository.save(student);
        }

        if (moduleRepository.count() > 0) return;

        saveModule("Algorithms and Data Structures",
                "Algorithms and data structures are at the heart of every computer program. Understanding and knowing common algorithms and data structures is therefore valuable for programmers. In this course we look at some basic linear data structures such as arrays, lists, stacks, and queues as well as some more advanced non-linear data structures such as trees and graphs. In both cases, common algorithms operating on the data structures are covered. A research case study on data structures in complex systems modelling and lectures on artificial intelligence round off the course. In addition, there are tutorials for each lecture implementing the treated data structures and algorithms. The course is provided online with video lectures, chat discussions, and individual coaching.",
                3, "Prof. Dr. Patrik Christen", "patrik.christen@fhnw.ch", 4, "Basel", ModuleType.ELECTIVE);

        saveModule("Business Intelligence",
                "The first part of the module \"Data Warehousing\" (50%) provides an introduction to Business Intelligence (BI), with a focus on the fundamental concepts and technologies of Data Warehousing (DWH). In particular, we will discuss basic aspects of modeling multidimensional data structures and OLAP data analysis.\r\n" + //
                                                "\r\n" + //
                                                "The second part, \"Introduction to Machine Learning\" (25%), provides a first insight into the world of advanced analytics. Some of the fundamental concepts of machine learning and AI are introduced, and basic examples of supervised and unsupervised learning algorithms are discussed.\r\n" + //
                                                "\r\n" + //
                                                "The third part, \"Data Storytelling\" (25%) introduces the fundamentals and principles of visual information design and data storytelling. Students learn how complex data structures and the results of data analytics can be communicated in a target oriented and context aware fashion that supports managerial decision making.",
                5, "Dr. Gwendolin Wilke", "gwendolin.wilke@fhnw.ch", 4, "Basel", ModuleType.COMPULSORY);

        saveModule("Internet Technology",
                "This module gives students an overview of the most important methods and concepts of a web architecture and focuses on the competent use of selected and state-of-the-art web technologies, which are relevant in an enterprise application domain. Besides, this module drives the digitalization by reflecting concepts such as Web APIs, API Lifecycle Management, microservice design and web technologies. Finally, this module sharpens the understanding of an economical software development using frameworks and selected libraries as well as deployment scenarios.",
                5, "Dr. Devid Montecchiari", "devid.montecchiari@fhnw.ch", 4, "Basel", ModuleType.COMPULSORY);

        saveModule("Logistics and Supply Chain Management",
                "Co-creating value in networks is key to 21st century business success. Companies expect business information technology students to be aware of this, and that they are equipped with the right toolbox to create value in a customer-centric, networked and sustainable way.\r\n" + //
                                                "\r\n" + //
                                                "As a student, you must understand the workings of these success factors and their interplay with business information technology. That means understanding how connectivity and physical and digital value creation can be combined, and where innovation potential arises in this development: economically, ecologically, and socially.\r\n" + //
                                                "\r\n" + //
                                                "In this module, you will learn about the basic terms, concepts, methods and tools of Supply Chain Management & Logistics that will help you shape the networked economy of the 21st century in a sustainable way.",
                5, "Dr. John Paul Manning", "johnpaul.manning@fhnw.ch", 4, "Basel", ModuleType.COMPULSORY);

        saveModule("Statistics and Probability",
                "Data analysis and basic statistical concepts have become indispensable in everyday professional life. This course is designed to enable students to correctly classify and evaluate statistical variables in relation to their level of measurement. With acquired knowledge of probability calculations, distributions and statistical tests, evaluations and analyses can be correctly commented on and, if necessary, critically questioned.",
                5, "Prof. Dr. Tobias Schoch", "tobias.schoch@fhnw.ch", 4, "Basel", ModuleType.COMPULSORY);

        saveModule("Topics in Business Information Technology",
                "Business information specialists are faced with new technologies and trends throughout their working lives. They must be able to acquaint themselves with new information quickly and independently, in order to evaluate these technologies and trends for business use. Many businesses operate globally, and important meetings are held in English. The goal of Tobit is to reproduce this situation for students.",
                5, "Jacqueline Vitacco", "jacqueline.vitacco@fhnw.ch", 4, "Basel", ModuleType.COMPULSORY);

        saveModule("Quantum Disruption",
                "Quantum computing (QC) is no longer a distant breakthrough—it is rapidly transforming industries and redefining the rules of business. As this cutting-edge technology advances, new opportunities and challenges emerge across key sectors, including finance, pharmaceuticals, logistics, and cybersecurity. Companies are already leveraging QC-powered algorithms to optimize complex financial models, revolutionize drug discovery, streamline global supply chains, and enhance digital security.\r\n" + //
                                                "\r\n" + //
                                                "Switzerland, a global hub for innovation, must stay ahead in this quantum revolution. According to the Swiss Academy of Engineering Sciences (SATW), seizing this opportunity is essential for maintaining a competitive edge.\r\n" + //
                                                "\r\n" + //
                                                "Our interactive course is designed specifically for business and business informatics students, equipping you with the insights needed to navigate and capitalize on the quantum driven economy. How will quantum technology disrupt markets, reshape industries, and influence strategic decision-making? Will it be a force for security and trust—or an unprecedented challenge?\r\n" + //
                                                "\r\n" + //
                                                "Join us on this exciting learning journey to explore the future of business in a quantum world — with a special focus on the Swiss innovation and business ecosystem!",
                3, "Prof. Dr. Bettina Schneider", "bettina.schneider@fhnw.ch", 4, "Basel", ModuleType.ELECTIVE);

        saveModule("Social Engineering with Africa",
                "Social engineering represents a significant threat and highlights the importance of human factors in cybersecurity. Social engineering relies on manipulating human psychology, emotions, and behaviors to deceive individuals into divulging confidential information, clicking on malicious links, or performing actions that compromise security. Hereby, the cultural context plays an essential role. Understanding the tactics and cultural differences is crucial for individuals and organizations to defend against social engineering attacks. This module offers a combination of: a) getting a deep-dive into the field of social engineering and b) exchanging virtually with students from Cameroon. The structure will be as follows: 1) we start in week 1 with an introduction to the African and specifically Cameroonian culture 2) in week 2-5 you learn about social engineering and work on adapting/collecting learning material in order to pass your knowledge to African students. 3) as self-study and assignment you organize and conduct virtual weekly mentoring sessions with African students (1 or more students assigned to you), 4) in week 6 we close with a wrap-up and reflection.",
                3, "Franka Ebob Enow Ebai", "franka.ebai@fhnw.ch", 4, "Basel", ModuleType.ELECTIVE);
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
