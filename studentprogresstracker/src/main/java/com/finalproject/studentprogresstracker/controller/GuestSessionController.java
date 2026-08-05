package com.finalproject.studentprogresstracker.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.entity.GuestSession;
import com.finalproject.studentprogresstracker.service.GuestSessionService;

@RestController
@RequestMapping("/api/guest-sessions")
@CrossOrigin(origins = "*")
public class GuestSessionController {

    @Autowired
    private GuestSessionService guestSessionService;

    // Add Guest Session
    @PostMapping("/add")
    public ResponseEntity<GuestSession> addGuestSession(
            @RequestBody GuestSession guestSession) {

        return new ResponseEntity<>(
                guestSessionService.addGuestSession(guestSession),
                HttpStatus.CREATED);
    }

    // Get All Guest Sessions
    @GetMapping("/all")
    public ResponseEntity<List<GuestSession>> getAllGuestSessions() {

        return ResponseEntity.ok(
                guestSessionService.getAllGuestSessions());
    }

    // Get Guest Session By Id
    @GetMapping("/{sessionId}")
    public ResponseEntity<GuestSession> getGuestSessionById(
            @PathVariable String sessionId) {

        return ResponseEntity.ok(
                guestSessionService.getGuestSessionById(sessionId));
    }

    // Get Guest Sessions By Trainer
    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<List<GuestSession>> getGuestSessionByTrainer(
            @PathVariable String trainerId) {

        return ResponseEntity.ok(
                guestSessionService.getGuestSessionByTrainer(trainerId));
    }

    // Get Guest Sessions By Date
    @GetMapping("/date/{sessionDate}")
    public ResponseEntity<List<GuestSession>> getGuestSessionByDate(
            @PathVariable LocalDate sessionDate) {

        return ResponseEntity.ok(
                guestSessionService.getGuestSessionByDate(sessionDate));
    }

    // Update Guest Session
    @PutMapping("/update/{sessionId}")
    public ResponseEntity<GuestSession> updateGuestSession(
            @PathVariable String sessionId,
            @RequestBody GuestSession guestSession) {

        return ResponseEntity.ok(
                guestSessionService.updateGuestSession(sessionId, guestSession));
    }

    // Delete Guest Session
    @DeleteMapping("/delete/{sessionId}")
    public ResponseEntity<String> deleteGuestSession(
            @PathVariable String sessionId) {

        return ResponseEntity.ok(
                guestSessionService.deleteGuestSession(sessionId));
    }

}