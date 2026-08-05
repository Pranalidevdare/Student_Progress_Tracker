package com.finalproject.studentprogresstracker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.entity.Performance;
import com.finalproject.studentprogresstracker.service.PerformanceService;

@RestController
@RequestMapping("/api/performance")
@CrossOrigin(origins = "*")
public class PerformanceController {

    @Autowired
    private PerformanceService performanceService;

    // Add Performance
    @PostMapping("/add")
    public ResponseEntity<Performance> addPerformance(
            @RequestBody Performance performance) {

        return new ResponseEntity<>(
                performanceService.addPerformance(performance),
                HttpStatus.CREATED);
    }

    // Get All Performance
    @GetMapping("/all")
    public ResponseEntity<List<Performance>> getAllPerformance() {

        return ResponseEntity.ok(
                performanceService.getAllPerformance());
    }

    // Get Performance By Id
    @GetMapping("/{performanceId}")
    public ResponseEntity<Performance> getPerformanceById(
            @PathVariable String performanceId) {

        return ResponseEntity.ok(
                performanceService.getPerformanceById(performanceId));
    }

    // Get Performance By Student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Performance>> getPerformanceByStudent(
            @PathVariable String studentId) {

        return ResponseEntity.ok(
                performanceService.getPerformanceByStudent(studentId));
    }

    // Get Performance By Trainer
    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<List<Performance>> getPerformanceByTrainer(
            @PathVariable String trainerId) {

        return ResponseEntity.ok(
                performanceService.getPerformanceByTrainer(trainerId));
    }

    // Update Performance
    @PutMapping("/update/{performanceId}")
    public ResponseEntity<Performance> updatePerformance(
            @PathVariable String performanceId,
            @RequestBody Performance performance) {

        return ResponseEntity.ok(
                performanceService.updatePerformance(performanceId, performance));
    }

    // Delete Performance
    @DeleteMapping("/delete/{performanceId}")
    public ResponseEntity<String> deletePerformance(
            @PathVariable String performanceId) {

        return ResponseEntity.ok(
                performanceService.deletePerformance(performanceId));
    }

}