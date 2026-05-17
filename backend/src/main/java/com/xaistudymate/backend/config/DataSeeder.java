package com.xaistudymate.backend.config;

import com.xaistudymate.backend.entity.Role;
import com.xaistudymate.backend.entity.User;
import com.xaistudymate.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Seeds a default admin user on first startup.
 */
@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    CommandLineRunner seedAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "admin@xaistudymate.com";
            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = User.builder()
                        .fullName("Admin")
                        .email(adminEmail)
                        .password(passwordEncoder.encode("admin123"))
                        .role(Role.ADMIN)
                        .build();
                userRepository.save(admin);
                log.info("Default admin user created: {}", adminEmail);
            }
        };
    }
}
