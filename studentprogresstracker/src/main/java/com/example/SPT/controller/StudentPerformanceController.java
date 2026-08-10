package com.example.SPT.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.response.PerformanceResponse;
import com.example.SPT.service.PerformanceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student/performance")
@RequiredArgsConstructor
@CrossOrigin("*")
public class StudentPerformanceController {

    private final PerformanceService performanceService;

    @GetMapping("/{studentId}")
    public ResponseEntity<PerformanceResponse> getPerformance(
            @PathVariable String studentId) {

        return ResponseEntity.ok(
                performanceService.getPerformance(studentId));
    }

}