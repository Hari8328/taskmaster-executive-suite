package com.taskmaster.controller;

import com.taskmaster.dto.PageResponse;
import com.taskmaster.model.Task;
import com.taskmaster.model.User;
import com.taskmaster.repository.TaskRepository;
import com.taskmaster.repository.UserRepository;
import com.taskmaster.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getMyTasks(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        User user = userRepository.findById(principal.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Pageable pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by("id").descending());
        Page<Task> taskPage = taskRepository.findByUser(user, pageable);

        PageResponse<Task> pageResponse = PageResponse.<Task>builder()
                .content(taskPage.getContent())
                .totalPages(taskPage.getTotalPages())
                .totalElements(taskPage.getTotalElements())
                .size(taskPage.getSize())
                .number(taskPage.getNumber())
                .build();

        return ResponseEntity.ok(pageResponse);
    }

    @PostMapping
    public ResponseEntity<?> createTask(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Task taskData) {

        User user = userRepository.findById(principal.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Normalize status and priority
        if (taskData.getStatus() != null) {
            taskData.setStatus(taskData.getStatus().toUpperCase());
        }
        if (taskData.getPriority() != null) {
            taskData.setPriority(taskData.getPriority().toUpperCase());
        }

        String status = taskData.getStatus();
        if ("IN_PROGRESS".equals(status) || "IN-PROGRESS".equals(status)) {
            if (taskData.getStartedAt() == null) {
                taskData.setStartedAt(Instant.now());
            }
        } else if ("COMPLETED".equals(status)) {
            if (taskData.getCompletedAt() == null) {
                taskData.setCompletedAt(Instant.now());
            }
            if (taskData.getStartedAt() == null) {
                taskData.setStartedAt(taskData.getCompletedAt());
            }
        }

        taskData.setUser(user);
        Task savedTask = taskRepository.save(taskData);
        return ResponseEntity.ok(savedTask);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") Long id,
            @RequestBody Task taskUpdates) {

        User user = userRepository.findById(principal.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        Task task;
        if (isAdmin) {
            task = taskRepository.findById(id).orElse(null);
        } else {
            task = taskRepository.findById(id).orElse(null);
            if (task != null && task.getUser() != null && !task.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        if (task == null) {
            return ResponseEntity.notFound().build();
        }

        // Apply updates
        if (taskUpdates.getTitle() != null) {
            task.setTitle(taskUpdates.getTitle());
        }
        if (taskUpdates.getDescription() != null) {
            task.setDescription(taskUpdates.getDescription());
        }
        if (taskUpdates.getCategory() != null) {
            task.setCategory(taskUpdates.getCategory());
        }
        if (taskUpdates.getDueDate() != null) {
            task.setDueDate(taskUpdates.getDueDate());
        }
        if (taskUpdates.getReminderMinutes() != null) {
            task.setReminderMinutes(taskUpdates.getReminderMinutes());
        }

        // Status transition tracking
        String currentStatus = task.getStatus();
        String nextStatus = taskUpdates.getStatus();

        if (nextStatus != null) {
            nextStatus = nextStatus.toUpperCase();
            task.setStatus(nextStatus);

            if ("IN_PROGRESS".equals(nextStatus) || "IN-PROGRESS".equals(nextStatus)) {
                if (!"IN_PROGRESS".equals(currentStatus) && !"IN-PROGRESS".equals(currentStatus)) {
                    if (task.getStartedAt() == null && taskUpdates.getStartedAt() == null) {
                        task.setStartedAt(Instant.now());
                    }
                }
            } else if ("COMPLETED".equals(nextStatus)) {
                if (!"COMPLETED".equals(currentStatus)) {
                    Instant completedAt = taskUpdates.getCompletedAt() != null 
                            ? taskUpdates.getCompletedAt() 
                            : Instant.now();
                    task.setCompletedAt(completedAt);

                    if (task.getStartedAt() == null && taskUpdates.getStartedAt() == null) {
                        task.setStartedAt(completedAt);
                    }
                }
            }
        }

        if (taskUpdates.getPriority() != null) {
            task.setPriority(taskUpdates.getPriority().toUpperCase());
        }

        Task savedTask = taskRepository.save(task);
        return ResponseEntity.ok(savedTask);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") Long id) {

        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        Task task = taskRepository.findById(id).orElse(null);
        if (task == null) {
            return ResponseEntity.notFound().build();
        }

        if (!isAdmin && task.getUser() != null && !task.getUser().getId().equals(principal.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        taskRepository.delete(task);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getAllTasksAdmin(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by("id").descending());
        Page<Task> taskPage = taskRepository.findAll(pageable);

        PageResponse<Task> pageResponse = PageResponse.<Task>builder()
                .content(taskPage.getContent())
                .totalPages(taskPage.getTotalPages())
                .totalElements(taskPage.getTotalElements())
                .size(taskPage.getSize())
                .number(taskPage.getNumber())
                .build();

        return ResponseEntity.ok(pageResponse);
    }
}
