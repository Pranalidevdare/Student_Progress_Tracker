package com.example.SPT.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.request.AptitudeScheduleRequest;
import com.example.SPT.dto.request.AptitudeTestScheduleRequest;
import com.example.SPT.dto.response.AptitudeScheduleResponse;
import com.example.SPT.dto.response.AptitudeTestScheduleResponse;
import com.example.SPT.service.AptitudeScheduleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/aptitude")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminAptitudeScheduleController {

    private final AptitudeScheduleService
            aptitudeScheduleService;

    @PostMapping("/schedule")
    public ResponseEntity<AptitudeScheduleResponse>
    scheduleTest(
            @Valid @RequestBody
            AptitudeScheduleRequest request) {

        AptitudeScheduleResponse response =
                aptitudeScheduleService.scheduleTest(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
    

    @GetMapping("/schedules")
    public ResponseEntity<List<AptitudeScheduleResponse>>
    getAllSchedules() {

        return ResponseEntity.ok(
                aptitudeScheduleService.getAllSchedules());
    }

    @GetMapping("/schedule/{id}")
    public ResponseEntity<AptitudeScheduleResponse>
    getScheduleById(@PathVariable String id) {

        return ResponseEntity.ok(
                aptitudeScheduleService.getScheduleById(id));
    }

    @PutMapping("/schedule/{id}/cancel")
    public ResponseEntity<String>
    cancelSchedule(@PathVariable String id) {

        aptitudeScheduleService.cancelSchedule(id);

        return ResponseEntity.ok(
                "Aptitude test schedule cancelled successfully");
    }
}