package com.xaistudymate.backend.config;

import com.xaistudymate.backend.entity.Role;
import com.xaistudymate.backend.entity.StudentProfile;
import com.xaistudymate.backend.entity.User;
import com.xaistudymate.backend.repository.StudentProfileRepository;
import com.xaistudymate.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;

@Configuration
public class DemoStudentDataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DemoStudentDataSeeder.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    private static final List<DemoStudent> DEMO_STUDENTS = List.of(
            new DemoStudent("Aarav Sharma", "Male", 21, "BTech", "Computer Science", 8.6, 0, 2, 4, 8, 7, 82, 3),
            new DemoStudent("Ananya Patel", "Female", 22, "BE", "Information Technology", 9.1, 0, 3, 5, 9, 8, 91, 4),
            new DemoStudent("Ishaan Verma", "Male", 21, "BTech", "Electronics", 7.2, 1, 1, 2, 6, 7, 68, 2),
            new DemoStudent("Diya Nair", "Female", 20, "BSc", "Computer Science", 8.0, 0, 1, 3, 7, 9, 77, 3),
            new DemoStudent("Rohan Gupta", "Male", 23, "BE", "Mechanical", 6.8, 2, 0, 1, 5, 6, 61, 1),
            new DemoStudent("Meera Iyer", "Female", 21, "BTech", "Electrical", 8.8, 0, 2, 4, 8, 9, 88, 4),
            new DemoStudent("Kabir Singh", "Male", 22, "BTech", "Information Technology", 7.7, 0, 2, 3, 7, 6, 73, 2),
            new DemoStudent("Saanvi Rao", "Female", 20, "BE", "Computer Science", 9.4, 0, 3, 6, 10, 9, 95, 5),
            new DemoStudent("Arjun Das", "Male", 21, "BCA", "Computer Applications", 7.0, 1, 1, 2, 6, 7, 65, 2),
            new DemoStudent("Tara Menon", "Female", 22, "BTech", "Electronics", 8.3, 0, 2, 3, 8, 8, 84, 3)
    );

    @Bean
    CommandLineRunner seedDemoStudents(
            UserRepository userRepository,
            StudentProfileRepository profileRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.demo-data.enabled:false}") boolean enabled) {
        return args -> {
            if (!enabled) {
                log.info("Demo student seeding is disabled");
                return;
            }

            int createdProfiles = 0;
            for (int i = 0; i < DEMO_STUDENTS.size(); i++) {
                DemoStudent sample = DEMO_STUDENTS.get(i);
                String email = "demo-student-%02d@example.invalid".formatted(i + 1);
                User user = userRepository.findByEmail(email).orElseGet(() -> userRepository.save(
                        User.builder()
                                .fullName(sample.name())
                                .email(email)
                                .password(passwordEncoder.encode(randomPassword()))
                                .role(Role.STUDENT)
                                .build()));

                if (!profileRepository.existsByUserId(user.getId())) {
                    profileRepository.save(sample.toProfile(user));
                    createdProfiles++;
                }
            }
            log.info("Demo student seeding enabled; created {} synthetic student profiles", createdProfiles);
        };
    }

    private static String randomPassword() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes);
    }

    private record DemoStudent(
            String name,
            String gender,
            int age,
            String degree,
            String branch,
            double cgpa,
            int backlogs,
            int internships,
            int certifications,
            int codingSkills,
            int communicationSkills,
            int aptitudeScore,
            int projects) {

        private StudentProfile toProfile(User user) {
            return StudentProfile.builder()
                    .user(user)
                    .gender(gender)
                    .age(age)
                    .degree(degree)
                    .branch(branch)
                    .cgpa(cgpa)
                    .backlogs(backlogs)
                    .internships(internships)
                    .certifications(certifications)
                    .codingSkills(codingSkills)
                    .communicationSkills(communicationSkills)
                    .aptitudeScore(aptitudeScore)
                    .projects(projects)
                    .build();
        }
    }
}
