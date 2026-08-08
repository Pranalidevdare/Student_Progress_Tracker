package com.finalproject.studentprogresstracker.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.dto.request.StudentRequest;
import com.finalproject.studentprogresstracker.dto.request.StudentUpdateRequest;
import com.finalproject.studentprogresstracker.dto.response.StudentDashboardResponse;
import com.finalproject.studentprogresstracker.dto.response.StudentResponse;
import com.finalproject.studentprogresstracker.service.StudentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@CrossOrigin("*")
public class StudentController {

    private final StudentService studentService;

    @PostMapping
    public ResponseEntity<StudentResponse> registerStudent(
            @Valid @RequestBody StudentRequest request) {

        return new ResponseEntity<>(
                studentService.registerStudent(request),
                HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getStudentById(
            @PathVariable String id) {

        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @GetMapping
    public ResponseEntity<List<StudentResponse>> getAllStudents() {

        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentResponse> updateStudent(
            @PathVariable String id,
            @Valid @RequestBody StudentUpdateRequest request) {

        return ResponseEntity.ok(
                studentService.updateStudent(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStudent(
            @PathVariable String id) {

        studentService.deleteStudent(id);

        return ResponseEntity.ok("Student deleted successfully.");
    }

    @GetMapping("/{studentId}/dashboard")
    public ResponseEntity<StudentDashboardResponse> getDashboard(
            @PathVariable String studentId) {

        return ResponseEntity.ok(
                studentService.getStudentDashboard(studentId));
    }

}