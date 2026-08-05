package com.finalproject.studentprogresstracker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.entity.Trainer;
import com.finalproject.studentprogresstracker.service.TrainerService;

@RestController
@RequestMapping("/api/trainers")
@CrossOrigin(origins = "*")
public class TrainerController {

    @Autowired
    private TrainerService trainerService;

    // Add Trainer
    @PostMapping("/add")
    public ResponseEntity<Trainer> addTrainer(@RequestBody Trainer trainer) {
        return new ResponseEntity<>(trainerService.addTrainer(trainer), HttpStatus.CREATED);
    }

    // Get All Trainers
    @GetMapping("/all")
    public ResponseEntity<List<Trainer>> getAllTrainer() {
        return ResponseEntity.ok(trainerService.getAllTrainer());
    }

    // Get Trainer By Id
    @GetMapping("/{trainerId}")
    public ResponseEntity<Trainer> getTrainerById(@PathVariable String trainerId) {
        return ResponseEntity.ok(trainerService.getTrainerById(trainerId));
    }

    // Get Trainer By Email
    @GetMapping("/email/{email}")
    public ResponseEntity<Trainer> getTrainerByEmail(@PathVariable String email) {
        return ResponseEntity.ok(trainerService.getTrainerByEmail(email));
    }

    // Get Trainer By Name
    @GetMapping("/name/{trainerName}")
    public ResponseEntity<Trainer> getTrainerByName(@PathVariable String trainerName) {
        return ResponseEntity.ok(trainerService.getTrainerByName(trainerName));
    }

    // Update Trainer
    @PutMapping("/update/{trainerId}")
    public ResponseEntity<Trainer> updateTrainer(
            @PathVariable String trainerId,
            @RequestBody Trainer trainer) {

        return ResponseEntity.ok(trainerService.updateTrainer(trainerId, trainer));
    }

    // Delete Trainer
    @DeleteMapping("/delete/{trainerId}")
    public ResponseEntity<String> deleteTrainer(@PathVariable String trainerId) {

        return ResponseEntity.ok(trainerService.deleteTrainer(trainerId));
    }

    // Activate Trainer
    @PutMapping("/activate/{trainerId}")
    public ResponseEntity<Trainer> activateTrainer(@PathVariable String trainerId) {

        return ResponseEntity.ok(trainerService.activateTrainer(trainerId));
    }

    // Deactivate Trainer
    @PutMapping("/deactivate/{trainerId}")
    public ResponseEntity<Trainer> deactivateTrainer(@PathVariable String trainerId) {

        return ResponseEntity.ok(trainerService.deactivateTrainer(trainerId));
    }

}