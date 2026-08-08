package com.finalproject.studentprogresstracker.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.dto.response.TopperResponse;
import com.finalproject.studentprogresstracker.service.TopperService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trainer/toppers")
@RequiredArgsConstructor
public class TrainerTopperController {

    private final TopperService topperService;

    // Get all toppers
    @GetMapping
    public ResponseEntity<List<TopperResponse>> getAllToppers() {

        return ResponseEntity.ok(
                topperService.getAllToppers());
    }

    // Get toppers by batch
    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<TopperResponse>> getToppersByBatch(
            @PathVariable String batchId) {

        return ResponseEntity.ok(
                topperService.getToppersByBatch(batchId));
    }

    // Get Top N Rankers
    @GetMapping("/top/{limit}")
    public ResponseEntity<List<TopperResponse>> getTopRankers(
            @PathVariable int limit) {

        return ResponseEntity.ok(
                topperService.getTopRankers(limit));
    }

}