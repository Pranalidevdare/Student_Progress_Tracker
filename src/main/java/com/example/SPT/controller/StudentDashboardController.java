package com.example.SPT.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.response.StudentDashboardResponse;
import com.example.SPT.service.StudentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/api/student/dashboard", "/api/students/dashboard"})
@RequiredArgsConstructor
@CrossOrigin("*")
public class StudentDashboardController {

    private final StudentService studentService;

    @GetMapping({"", "/me"})
    public ResponseEntity<StudentDashboardResponse> getMyDashboard(
            Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            throw new AccessDeniedException("User is not authenticated");
        }

        String principal = authentication.getName();
        return ResponseEntity.ok(
                studentService.getStudentDashboard(principal));
    }

    @GetMapping("/{studentId}")
    public ResponseEntity<StudentDashboardResponse> getDashboard(
            @PathVariable String studentId,
            Authentication authentication) {

        if (authentication != null) {
            boolean isAdminOrTrainer = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(a -> a.equals("ROLE_ADMIN") || a.equals("ROLE_TRAINER"));

            // If a student tries to query another student ID, force returning their own data
            if (!isAdminOrTrainer) {
                String principal = authentication.getName();
                return ResponseEntity.ok(
                        studentService.getStudentDashboard(principal));
            }
        }

        return ResponseEntity.ok(
                studentService.getStudentDashboard(studentId));
    }

}