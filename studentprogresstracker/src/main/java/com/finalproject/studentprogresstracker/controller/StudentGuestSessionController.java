package com.finalproject.studentprogresstracker.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.dto.response.GuestSessionResponse;
import com.finalproject.studentprogresstracker.service.GuestSessionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student/guest-sessions")
@RequiredArgsConstructor
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