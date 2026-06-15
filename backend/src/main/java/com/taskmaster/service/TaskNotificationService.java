package com.taskmaster.service;

import com.taskmaster.model.Notification;
import com.taskmaster.model.Task;
import com.taskmaster.repository.NotificationRepository;
import com.taskmaster.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class TaskNotificationService {
    private static final Logger logger = LoggerFactory.getLogger(TaskNotificationService.class);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
            .withZone(ZoneId.systemDefault());

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkUpcomingTasks() {
        try {
            Instant now = Instant.now();
            Instant tomorrow = now.plus(24, ChronoUnit.HOURS);

            // 1. Fetch tasks due in the next 24 hours that are not COMPLETED
            List<Task> standardUpcoming = taskRepository.findByStatusNotAndDueDateBetween("COMPLETED", now, tomorrow);

            // 2. Fetch tasks with custom reminders
            List<Task> customUpcoming = taskRepository.findByStatusNotAndReminderMinutesGreaterThanAndDueDateGreaterThan(
                    "COMPLETED", 0, now
            );

            List<Task> tasksToNotify = new ArrayList<>(standardUpcoming);

            for (Task task : customUpcoming) {
                if (task.getDueDate() == null || task.getReminderMinutes() == null) {
                    continue;
                }
                Instant reminderTime = task.getDueDate().minus(task.getReminderMinutes(), ChronoUnit.MINUTES);
                
                // If now is past or at the reminder time and within the last 2 minutes
                if (now.isAfter(reminderTime) && now.isBefore(reminderTime.plus(2, ChronoUnit.MINUTES))) {
                    if (!tasksToNotify.contains(task)) {
                        tasksToNotify.add(task);
                    }
                }
            }

            for (Task task : tasksToNotify) {
                if (task.getUser() == null) {
                    continue;
                }

                boolean isCustom = false;
                if (task.getReminderMinutes() != null && task.getReminderMinutes() > 0) {
                    Instant reminderTime = task.getDueDate().minus(task.getReminderMinutes(), ChronoUnit.MINUTES);
                    if (now.isAfter(reminderTime) && now.isBefore(reminderTime.plus(10, ChronoUnit.MINUTES))) {
                        isCustom = true;
                    }
                }

                String message;
                if (isCustom) {
                    message = String.format("Reminder: \"%s\" is due in %d minutes!", task.getTitle(), task.getReminderMinutes());
                } else {
                    message = String.format("Task \"%s\" is due soon! (Due: %s)", task.getTitle(), formatter.format(task.getDueDate()));
                }

                // Prevent duplicate notifications in the last 12 hours
                Instant twelveHoursAgo = now.minus(12, ChronoUnit.HOURS);
                boolean exists = notificationRepository.existsByUserAndMessageAndCreatedAtGreaterThan(
                        task.getUser(), message, twelveHoursAgo
                );

                if (!exists) {
                    Notification notification = Notification.builder()
                            .message(message)
                            .type("DUE_SOON")
                            .user(task.getUser())
                            .build();
                    notificationRepository.save(notification);
                    logger.info("Sent due soon notification for task: '{}' to user: '{}'", task.getTitle(), task.getUser().getUsername());
                }
            }
        } catch (Exception e) {
            logger.error("Error in checking upcoming tasks: {}", e.getMessage(), e);
        }
    }
}
