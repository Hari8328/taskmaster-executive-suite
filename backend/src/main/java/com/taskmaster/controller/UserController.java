package com.taskmaster.controller;

import com.taskmaster.dto.ProfileUpdateRequest;
import com.taskmaster.model.User;
import com.taskmaster.repository.UserRepository;
import com.taskmaster.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertToProfileResponse(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(@AuthenticationPrincipal UserPrincipal principal,
                                               @RequestBody ProfileUpdateRequest request) {
        User user = userRepository.findById(principal.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        user.setDisplayName(request.getDisplayName());
        user.setEmail(request.getEmail());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setBio(request.getBio());
        user.setPhoneNumber(request.getPhoneNumber());

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(convertToProfileResponse(updatedUser));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getAllUsersAdmin() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    private Map<String, Object> convertToProfileResponse(User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("displayName", user.getDisplayName() != null ? user.getDisplayName() : user.getUsername());
        response.put("avatarUrl", user.getAvatarUrl());
        response.put("bio", user.getBio());
        response.put("phoneNumber", user.getPhoneNumber());
        response.put("roles", Arrays.asList(user.getRoles().split(",")));
        return response;
    }
}
