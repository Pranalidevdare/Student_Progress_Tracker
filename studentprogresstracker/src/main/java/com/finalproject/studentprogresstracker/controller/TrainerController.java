package com.finalproject.studentprogresstracker.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.dto.request.TrainerRequest;
import com.finalproject.studentprogresstracker.dto.response.TrainerDashboardResponse;
import com.finalproject.studentprogresstracker.dto.response.TrainerResponse;
import com.finalproject.studentprogresstracker.service.TrainerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trainers")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TrainerController {

    private final TrainerService trainerService;

    @PostMapping
    public ResponseEntity<TrainerResponse> registerTrainer(
            @Valid @RequestBody TrainerRequest request) {

        return new ResponseEntity<>(
                trainerService.registerTrainer(request),
                HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainerResponse> getTrainerById(
            @PathVariable String id) {

        return ResponseEntity.ok(
                trainerService.getTrainerById(id));
    }

    @GetMapping
    public ResponseEntity<List<TrainerResponse>> getAllTrainers() {

        return ResponseEntity.ok(
                trainerService.getAllTrainers());
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrainerResponse> updateTrainer(
            @PathVariable String id,
            @Valid @RequestBody TrainerRequest request) {

        return ResponseEntity.ok(
                trainerService.updateTrainer(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTrainer(
            @PathVariable String id) {

        trainerService.deleteTrainer(id);

        return ResponseEntity.ok("Trainer deleted successfully.");
    }

    @GetMapping("/{trainerId}/dashboard")
    public ResponseEntity<TrainerDashboardResponse> getTrainerDashboard(
            @PathVariable String trainerId) {

        return ResponseEntity.ok(
                trainerService.getTrainerDashboard(trainerId));
    }

}