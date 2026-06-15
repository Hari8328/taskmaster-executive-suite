package com.taskmaster.service;

import com.taskmaster.model.Category;
import com.taskmaster.model.User;
import com.taskmaster.repository.CategoryRepository;
import com.taskmaster.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
public class DatabaseInitializer implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Predefined Categories
        List<String> categoryNames = Arrays.asList(
                "UI/UX", "Backend", "Frontend", "Marketing", "DevOps", "Planning", "Sports", "Study"
        );

        for (String name : categoryNames) {
            if (!categoryRepository.existsByName(name)) {
                categoryRepository.save(Category.builder().name(name).build());
                logger.info("Seeded category: {}", name);
            }
        }

        // 2. Seed / Update Default Admin User
        Optional<User> adminOpt = userRepository.findByUsername("admin");
        if (adminOpt.isEmpty()) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .email("admin@taskmaster.com")
                    .roles("ROLE_USER,ROLE_ADMIN")
                    .displayName("Admin Architect")
                    .build();

            userRepository.save(admin);
            logger.info("Seeded default administrator user: admin / admin123");
        } else {
            User admin = adminOpt.get();
            if (admin.getRoles() == null || admin.getRoles().trim().isEmpty() || !admin.getRoles().contains("ROLE_ADMIN")) {
                admin.setRoles("ROLE_USER,ROLE_ADMIN");
                userRepository.save(admin);
                logger.info("Updated legacy 'admin' user roles to: ROLE_USER,ROLE_ADMIN");
            }
        }
    }
}
