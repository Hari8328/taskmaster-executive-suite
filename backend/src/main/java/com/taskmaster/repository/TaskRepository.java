package com.taskmaster.repository;

import com.taskmaster.model.Task;
import com.taskmaster.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    Page<Task> findByUser(User user, Pageable pageable);
    List<Task> findByUser(User user);
    
    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.user")
    List<Task> findAllWithUser();

    List<Task> findByStatusNotAndDueDateBetween(String status, Instant start, Instant end);
    List<Task> findByStatusNotAndReminderMinutesGreaterThanAndDueDateGreaterThan(String status, int minReminder, Instant date);
}
