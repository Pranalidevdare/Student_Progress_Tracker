package com.example.SPT.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.response.TrainerDashboardResponse;
import com.example.SPT.service.TrainerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trainer/dashboard")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TrainerDashboardController {

    private final TrainerService trainerService;

    @GetMapping("/{trainerId}")
    public ResponseEntity<TrainerDashboardResponse> getDashboard(
            @PathVariable String trainerId) {

        return ResponseEntity.ok(
                trainerService.getTrainerDashboard(trainerId));
    }

}