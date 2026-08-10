package com.example.SPT.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.response.GuestSessionResponse;
import com.example.SPT.service.GuestSessionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student/guest-sessions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentGuestSessionController {

    private final GuestSessionService guestSessionService;

    @GetMapping
    public ResponseEntity<List<GuestSessionResponse>> getAllGuestSessions() {

        return ResponseEntity.ok(
                guestSessionService.getAllActiveGuestSessions());
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<GuestSessionResponse>> getGuestSessionsByBatch(
            @PathVariable String batchId) {

        return ResponseEntity.ok(
                guestSessionService.getActiveGuestSessionsByBatch(batchId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GuestSessionResponse> getGuestSessionById(
            @PathVariable String id) {

        return ResponseEntity.ok(
                guestSessionService.getGuestSessionById(id));
    }
}