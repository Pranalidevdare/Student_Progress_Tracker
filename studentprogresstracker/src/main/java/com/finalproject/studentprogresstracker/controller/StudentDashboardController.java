package com.finalproject.studentprogresstracker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.dto.response.StudentDashboardResponse;
import com.finalproject.studentprogresstracker.service.StudentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student/dashboard")
@RequiredArgsConstructor
@CrossOrigin("*")
public class StudentDashboardController {

    private final StudentService studentService;

    @GetMapping("/{studentId}")
    public ResponseEntity<StudentDashboardResponse> getDashboard(
            @PathVariable String studentId) {

        return ResponseEntity.ok(
                studentService.getStudentDashboard(studentId));
    }

}