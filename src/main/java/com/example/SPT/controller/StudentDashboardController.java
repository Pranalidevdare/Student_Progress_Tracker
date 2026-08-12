package com.example.SPT.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.response.StudentDashboardResponse;
import com.example.SPT.service.StudentService;

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