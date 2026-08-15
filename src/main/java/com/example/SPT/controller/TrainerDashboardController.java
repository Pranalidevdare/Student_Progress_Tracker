package com.example.SPT.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.response.TrainerDashboardResponse;
import com.example.SPT.service.TrainerService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/trainer/dashboard")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TrainerDashboardController {

    private final TrainerService trainerService;

    @GetMapping
    public ResponseEntity<TrainerDashboardResponse> getDashboard(
            @RequestParam(required = false) String trainerId,
            Authentication authentication) {

        String email = (authentication != null) ? authentication.getName() : null;
        return ResponseEntity.ok(
                trainerService.getTrainerDashboard(trainerId, email));
    }

    @GetMapping("/{trainerId}")
    public ResponseEntity<TrainerDashboardResponse> getDashboardByPath(
            @PathVariable String trainerId,
            Authentication authentication) {

        String email = (authentication != null) ? authentication.getName() : null;
        return ResponseEntity.ok(
                trainerService.getTrainerDashboard(trainerId, email));
    }

}