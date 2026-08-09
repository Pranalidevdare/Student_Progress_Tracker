package com.example.SPT.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.response.PerformanceResponse;
import com.example.SPT.service.PerformanceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trainer/performance")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TrainerPerformanceController {

    private final PerformanceService performanceService;

    @PutMapping("/{studentId}")
    public ResponseEntity<PerformanceResponse> updatePerformance(
            @PathVariable String studentId) {

        return ResponseEntity.ok(
                performanceService.updatePerformance(studentId));
    }

    @GetMapping("/{studentId}")
    public ResponseEntity<PerformanceResponse> getPerformance(
            @PathVariable String studentId) {

        return ResponseEntity.ok(
                performanceService.getPerformance(studentId));
    }

}