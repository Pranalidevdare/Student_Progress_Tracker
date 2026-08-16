package com.example.SPT.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.request.TrainerRequest;
import com.example.SPT.dto.response.TrainerDashboardResponse;
import com.example.SPT.dto.response.TrainerResponse;
import com.example.SPT.service.TrainerService;

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

    @GetMapping("/profile")
    public ResponseEntity<TrainerResponse> getTrainerProfile(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AccessDeniedException("User is not authenticated");
        }
        String email = authentication.getName();
        return ResponseEntity.ok(trainerService.getTrainerProfileByEmail(email));
    }

    @PutMapping("/profile")
    public ResponseEntity<TrainerResponse> updateTrainerProfile(
            Authentication authentication,
            @Valid @RequestBody TrainerRequest request) {

        if (authentication == null || authentication.getName() == null) {
            throw new AccessDeniedException("User is not authenticated");
        }
        String email = authentication.getName();
        return ResponseEntity.ok(trainerService.updateTrainerProfileByEmail(email, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainerResponse> getTrainerById(
            @PathVariable String id,
            Authentication authentication) {

        if ("profile".equalsIgnoreCase(id) || "me".equalsIgnoreCase(id)) {
            return getTrainerProfile(authentication);
        }

        TrainerResponse trainer = trainerService.getTrainerById(id);

        if (authentication != null && !isAdmin(authentication)) {
            String currentUserEmail = authentication.getName();
            if (!currentUserEmail.equalsIgnoreCase(trainer.getEmail()) && !id.equalsIgnoreCase(trainer.getId())) {
                throw new AccessDeniedException("Access Denied: You are not authorized to view another trainer's profile");
            }
        }

        return ResponseEntity.ok(trainer);
    }

    @GetMapping
    public ResponseEntity<List<TrainerResponse>> getAllTrainers() {

        return ResponseEntity.ok(
                trainerService.getAllTrainers());
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrainerResponse> updateTrainer(
            @PathVariable String id,
            @Valid @RequestBody TrainerRequest request,
            Authentication authentication) {

        if ("profile".equalsIgnoreCase(id) || "me".equalsIgnoreCase(id)) {
            return updateTrainerProfile(authentication, request);
        }

        TrainerResponse existingTrainer = trainerService.getTrainerById(id);

        if (authentication != null && !isAdmin(authentication)) {
            String currentUserEmail = authentication.getName();
            if (!currentUserEmail.equalsIgnoreCase(existingTrainer.getEmail()) && !id.equalsIgnoreCase(existingTrainer.getId())) {
                throw new AccessDeniedException("Access Denied: You are not authorized to update another trainer's profile");
            }
        }

        return ResponseEntity.ok(
                trainerService.updateTrainer(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTrainer(
            @PathVariable String id) {

        trainerService.deleteTrainer(id);

        return ResponseEntity.ok("Trainer deleted successfully.");
    }

    @GetMapping("/dashboard")
    public ResponseEntity<TrainerDashboardResponse> getTrainerDashboard(
            @RequestParam(required = false) String trainerId,
            Authentication authentication) {

        String email = (authentication != null) ? authentication.getName() : null;
        return ResponseEntity.ok(
                trainerService.getTrainerDashboard(trainerId, email));
    }

    @GetMapping("/{trainerId}/dashboard")
    public ResponseEntity<TrainerDashboardResponse> getTrainerDashboardByPath(
            @PathVariable String trainerId,
            Authentication authentication) {

        String email = (authentication != null) ? authentication.getName() : null;
        return ResponseEntity.ok(
                trainerService.getTrainerDashboard(trainerId, email));
    }

    private boolean isAdmin(Authentication authentication) {
        if (authentication == null) return false;
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if ("ROLE_ADMIN".equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }

}