package com.taskmaster.controller;

import com.taskmaster.dto.AuthResponse;
import com.taskmaster.dto.SigninRequest;
import com.taskmaster.dto.SignupRequest;
import com.taskmaster.model.Task;
import com.taskmaster.model.User;
import com.taskmaster.repository.TaskRepository;
import com.taskmaster.repository.UserRepository;
import com.taskmaster.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (signUpRequest.getUsername() == null || signUpRequest.getUsername().trim().length() < 3) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Username must be at least 3 characters long!");
        }

        if (signUpRequest.getPassword() == null || signUpRequest.getPassword().trim().length() < 6) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Password must be at least 6 characters long!");
        }

        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Username is already taken!");
        }

        // Create new user's account
        User user = User.builder()
                .username(signUpRequest.getUsername())
                .password(passwordEncoder.encode(signUpRequest.getPassword()))
                .email(signUpRequest.getUsername() + "@example.com")
                .roles("ROLE_USER")
                .build();

        User savedUser = userRepository.save(user);

        // Seed default tasks for the user
        List<Task> defaultTasks = Arrays.asList(
                Task.builder()
                        .title("Welcome to TaskMaster")
                        .description("Explore the dashboard and manage your tasks.")
                        .priority("LOW")
                        .category("General")
                        .user(savedUser)
                        .build(),
                Task.builder()
                        .title("Setup your profile")
                        .description("Go to settings to customize your display name and avatar.")
                        .priority("MEDIUM")
                        .category("Account")
                        .user(savedUser)
                        .build(),
                Task.builder()
                        .title("Create your first project")
                        .description("Group your tasks by category to see them in Projects view.")
                        .priority("HIGH")
                        .category("UI/UX")
                        .user(savedUser)
                        .build()
        );
        taskRepository.saveAll(defaultTasks);

        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody SigninRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication failed"));
        }

        String rolesStr = user.getRoles();
        if (rolesStr == null || rolesStr.trim().isEmpty()) {
            rolesStr = "ROLE_USER";
        }
        List<String> rolesList = Arrays.asList(rolesStr.split(","));
        String jwt = jwtUtils.generateJwtToken(user.getId(), user.getUsername(), rolesList);

        AuthResponse authResponse = AuthResponse.builder()
                .token(jwt)
                .username(user.getUsername())
                .displayName(user.getDisplayName() != null ? user.getDisplayName() : user.getUsername())
                .avatarUrl(user.getAvatarUrl())
                .roles(rolesList)
                .build();

        return ResponseEntity.ok(authResponse);
    }
}
