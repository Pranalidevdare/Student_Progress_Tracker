package com.example.SPT.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.response.TopperResponse;
import com.example.SPT.service.TopperService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student/toppers")
@RequiredArgsConstructor
public class StudentTopperController {

    private final TopperService topperService;

    // View all toppers
    @GetMapping
    public ResponseEntity<List<TopperResponse>> getAllToppers() {

        return ResponseEntity.ok(
                topperService.getAllToppers());
    }

    // View batch toppers
    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<TopperResponse>> getToppersByBatch(
            @PathVariable String batchId) {

        return ResponseEntity.ok(
                topperService.getToppersByBatch(batchId));
    }

    // View Top N Rankers
    @GetMapping("/top/{limit}")
    public ResponseEntity<List<TopperResponse>> getTopRankers(
            @PathVariable int limit) {

        return ResponseEntity.ok(
                topperService.getTopRankers(limit));
    }

}