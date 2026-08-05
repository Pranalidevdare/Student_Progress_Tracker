package com.finalproject.studentprogresstracker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.entity.Test;
import com.finalproject.studentprogresstracker.service.TestService;

@RestController
@RequestMapping("/api/tests")
@CrossOrigin(origins = "*")
public class TestController {

    @Autowired
    private TestService testService;

    // Create Test
    @PostMapping("/add")
    public ResponseEntity<Test> createTest(@RequestBody Test test) {

        return new ResponseEntity<>(
                testService.createTest(test),
                HttpStatus.CREATED);
    }

    // Get All Tests
    @GetMapping("/all")
    public ResponseEntity<List<Test>> getAllTests() {

        return ResponseEntity.ok(
                testService.getAllTests());
    }

    // Get Test By Id
    @GetMapping("/{testId}")
    public ResponseEntity<Test> getTestById(
            @PathVariable String testId) {

        return ResponseEntity.ok(
                testService.getTestById(testId));
    }

    // Get Tests By Trainer
    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<List<Test>> getTestsByTrainer(
            @PathVariable String trainerId) {

        return ResponseEntity.ok(
                testService.getTestsByTrainer(trainerId));
    }

    // Get Tests By Batch
    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<Test>> getTestsByBatch(
            @PathVariable String batchId) {

        return ResponseEntity.ok(
                testService.getTestsByBatch(batchId));
    }

    // Update Test
    @PutMapping("/update/{testId}")
    public ResponseEntity<Test> updateTest(
            @PathVariable String testId,
            @RequestBody Test test) {

        return ResponseEntity.ok(
                testService.updateTest(testId, test));
    }

    // Delete Test
    @DeleteMapping("/delete/{testId}")
    public ResponseEntity<String> deleteTest(
            @PathVariable String testId) {

        return ResponseEntity.ok(
                testService.deleteTest(testId));
    }

}