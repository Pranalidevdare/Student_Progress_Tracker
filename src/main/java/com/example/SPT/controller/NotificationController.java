package com.example.SPT.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.response.NotificationResponse;
import com.example.SPT.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/student/notifications")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin("*")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getStudentNotifications(
            Authentication authentication,
            @RequestParam(value = "studentId", required = false) String paramStudentId) {

        String studentId = (authentication != null && authentication.getName() != null && !authentication.getName().trim().isEmpty())
                ? authentication.getName()
                : (paramStudentId != null ? paramStudentId : "STU7076");

        log.info("GET notifications request for studentId: {}", studentId);
        return ResponseEntity.ok(notificationService.getNotificationsForStudent(studentId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            Authentication authentication,
            @RequestParam(value = "studentId", required = false) String paramStudentId) {

        String studentId = (authentication != null && authentication.getName() != null && !authentication.getName().trim().isEmpty())
                ? authentication.getName()
                : (paramStudentId != null ? paramStudentId : "STU7076");

        return ResponseEntity.ok(notificationService.getUnreadCount(studentId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            Authentication authentication,
            @RequestParam(value = "studentId", required = false) String paramStudentId) {

        String studentId = (authentication != null && authentication.getName() != null && !authentication.getName().trim().isEmpty())
                ? authentication.getName()
                : (paramStudentId != null ? paramStudentId : "STU7076");

        notificationService.markAllAsRead(studentId);
        return ResponseEntity.ok().build();
    }
}
