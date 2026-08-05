package com.finalproject.studentprogresstracker.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    // Get Dashboard Summary
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary() {

        return ResponseEntity.ok(
                dashboardService.getDashboardSummary());
    }

}