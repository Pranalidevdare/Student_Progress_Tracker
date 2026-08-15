package com.example.SPT.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.example.SPT.dto.request.StudentRequest;
import com.example.SPT.dto.request.StudentUpdateRequest;
import com.example.SPT.dto.response.StudentDashboardResponse;
import com.example.SPT.dto.response.StudentResponse;
import com.example.SPT.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@CrossOrigin("*")
public class StudentController {

    private final StudentService studentService;

    @PostMapping
    public ResponseEntity<StudentResponse> registerStudent(@Valid @RequestBody StudentRequest request) {
        return new ResponseEntity<>(studentService.registerStudent(request), HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<StudentResponse> getCurrentStudent(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        System.out.println("Authenticated user: " + email);
        return ResponseEntity.ok(studentService.getCurrentStudent(email));
    }

    @PutMapping("/me")
    public ResponseEntity<StudentResponse> updateCurrentStudent(
            Authentication authentication,
            @Valid @RequestBody StudentUpdateRequest request) {
        String email = authentication != null ? authentication.getName() : null;
        System.out.println("Updating profile for authenticated user: " + email);
        return ResponseEntity.ok(studentService.updateCurrentStudent(email, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getStudentById(@PathVariable String id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @GetMapping
    public ResponseEntity<List<StudentResponse>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentResponse> updateStudent(@PathVariable String id, @Valid @RequestBody StudentUpdateRequest request) {
        return ResponseEntity.ok(studentService.updateStudent(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStudent(@PathVariable String id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok("Student deleted successfully.");
    }

    @GetMapping("/{studentId}/dashboard")
    public ResponseEntity<StudentDashboardResponse> getDashboard(@PathVariable String studentId) {
        return ResponseEntity.ok(studentService.getStudentDashboard(studentId));
    }
}