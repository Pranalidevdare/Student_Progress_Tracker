package com.example.SPT.controller;


import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.request.AddTrainerRequest;
import com.example.SPT.dto.request.UpdateStudentRequest;
import com.example.SPT.dto.request.UpdateTrainerRequest;
import com.example.SPT.dto.response.AdminDashboardResponse;
import com.example.SPT.dto.response.StudentResponse;
import com.example.SPT.dto.response.UserResponse;
import com.example.SPT.service.AdminService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {

        return ResponseEntity.ok(adminService.getDashboard());

    }
    
    @GetMapping("/students")
    public ResponseEntity<List<StudentResponse>> getAllStudents() {

        return ResponseEntity.ok(adminService.getAllStudents());

    }
    
    @GetMapping("/students/{id}")
    public ResponseEntity<StudentResponse> getStudentById(
            @PathVariable String id) {

        return ResponseEntity.ok(adminService.getStudentById(id));

    }
    
    @PutMapping("/students/update/{id}")
    public ResponseEntity<StudentResponse> updateStudent(
            @PathVariable String id,
            @Valid @RequestBody UpdateStudentRequest request) {

        return ResponseEntity.ok(
                adminService.updateStudent(id, request));
    }
    
    
    @PatchMapping("/students/{id}/enable")
    public ResponseEntity<StudentResponse> enableStudent(
            @PathVariable String id) {

        return ResponseEntity.ok(adminService.enableStudent(id));
    }

    @PatchMapping("/students/{id}/disable")
    public ResponseEntity<StudentResponse> disableStudent(
            @PathVariable String id) {

        return ResponseEntity.ok(adminService.disableStudent(id));
    }
   
    @DeleteMapping("/students/delete/{id}")
    public ResponseEntity<String> deleteStudent(
            @PathVariable String id) {

        adminService.deleteStudent(id);

        return ResponseEntity.ok("Student deleted successfully");
    }
    
    @PostMapping("/trainers/add")
    public ResponseEntity<UserResponse> addTrainer(
            @Valid @RequestBody AddTrainerRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminService.addTrainer(request));
    }
    
    @GetMapping("/trainers")
    public ResponseEntity<List<UserResponse>> getAllTrainers() {

        return ResponseEntity.ok(adminService.getAllTrainers());

    }
    
    @GetMapping("/trainers/{id}")
    public ResponseEntity<UserResponse> getTrainerById(
            @PathVariable String id) {

        return ResponseEntity.ok(adminService.getTrainerById(id));
    }
    
    @PutMapping("/trainers/update/{id}")
    public ResponseEntity<UserResponse> updateTrainer(
            @PathVariable String id,
            @Valid @RequestBody UpdateTrainerRequest request) {

        return ResponseEntity.ok(
                adminService.updateTrainer(id, request));
    }

}