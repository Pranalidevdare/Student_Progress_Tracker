package com.finalproject.studentprogresstracker.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.dto.request.AttendanceRequest;
import com.finalproject.studentprogresstracker.dto.response.AttendanceResponse;
import com.finalproject.studentprogresstracker.service.AttendanceService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trainer/attendance")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TrainerAttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping
    public ResponseEntity<AttendanceResponse> markAttendance(
            @Valid @RequestBody AttendanceRequest request) {

        return new ResponseEntity<>(
                attendanceService.markAttendance(request),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttendanceResponse> updateAttendance(
            @PathVariable String id,
            @Valid @RequestBody AttendanceRequest request) {

        return ResponseEntity.ok(
                attendanceService.updateAttendance(id, request));
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByBatch(
            @PathVariable String batchId) {

        return ResponseEntity.ok(
                attendanceService.getAttendanceByBatch(batchId));
    }

}