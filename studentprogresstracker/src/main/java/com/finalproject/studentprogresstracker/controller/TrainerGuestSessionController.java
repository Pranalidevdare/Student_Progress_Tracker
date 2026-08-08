package com.finalproject.studentprogresstracker.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.dto.request.GuestSessionRequest;
import com.finalproject.studentprogresstracker.dto.response.GuestSessionResponse;
import com.finalproject.studentprogresstracker.service.GuestSessionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trainer/guest-sessions")
@RequiredArgsConstructor
public class TrainerGuestSessionController {

    private final GuestSessionService guestSessionService;

    @PostMapping
    public ResponseEntity<GuestSessionResponse> createGuestSession(
            @RequestBody GuestSessionRequest request) {

        return new ResponseEntity<>(
                guestSessionService.createGuestSession(request),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GuestSessionResponse> updateGuestSession(
            @PathVariable String id,
            @RequestBody GuestSessionRequest request) {

        return ResponseEntity.ok(
                guestSessionService.updateGuestSession(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteGuestSession(
            @PathVariable String id) {

        guestSessionService.deleteGuestSession(id);

        return ResponseEntity.ok("Guest Session deleted successfully.");
    }

    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<List<GuestSessionResponse>> getGuestSessionsByTrainer(
            @PathVariable String trainerId) {

        return ResponseEntity.ok(
                guestSessionService.getGuestSessionsByTrainer(trainerId));
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<GuestSessionResponse>> getGuestSessionsByBatch(
            @PathVariable String batchId) {

        return ResponseEntity.ok(
                guestSessionService.getGuestSessionsByBatch(batchId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GuestSessionResponse> getGuestSessionById(
            @PathVariable String id) {

        return ResponseEntity.ok(
                guestSessionService.getGuestSessionById(id));
    }

}