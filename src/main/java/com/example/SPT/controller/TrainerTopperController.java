package com.example.SPT.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.response.TopperResponse;
import com.example.SPT.service.TopperService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trainer/toppers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
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