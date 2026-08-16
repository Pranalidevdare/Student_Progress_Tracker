package com.example.SPT.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.request.AttendanceRequest;
import com.example.SPT.dto.request.BulkAttendanceRequest;
import com.example.SPT.dto.response.AttendanceResponse;
import com.example.SPT.dto.response.StudentMonthlyAttendanceResponse;
import com.example.SPT.dto.response.TodayAttendanceResponse;
import com.example.SPT.service.AttendanceService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trainer/attendance")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TrainerAttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/today")
    public ResponseEntity<TodayAttendanceResponse> getTodayAttendance(
            @RequestParam(required = false) String batchId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String sessionType,
            Authentication authentication) {

        String trainerEmail = (authentication != null) ? authentication.getName() : null;
        return ResponseEntity.ok(
                attendanceService.getTodayAttendance(batchId, date, sessionType, trainerEmail));
    }

    @PostMapping
    public ResponseEntity<AttendanceResponse> markAttendance(
            @Valid @RequestBody AttendanceRequest request,
            Authentication authentication) {

        String trainerEmail = (authentication != null) ? authentication.getName() : null;
        return new ResponseEntity<>(
                attendanceService.markAttendance(request, trainerEmail),
                HttpStatus.CREATED);
    }

    @PostMapping("/bulk")
    public ResponseEntity<TodayAttendanceResponse> bulkMarkAttendance(
            @Valid @RequestBody BulkAttendanceRequest request,
            Authentication authentication) {

        String trainerEmail = (authentication != null) ? authentication.getName() : null;
        return ResponseEntity.ok(
                attendanceService.bulkMarkAttendance(request, trainerEmail));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttendanceResponse> updateAttendance(
            @PathVariable String id,
            @Valid @RequestBody AttendanceRequest request,
            Authentication authentication) {

        String trainerEmail = (authentication != null) ? authentication.getName() : null;
        return ResponseEntity.ok(
                attendanceService.updateAttendance(id, request, trainerEmail));
    }

    @GetMapping("/student/{studentId}/monthly")
    public ResponseEntity<StudentMonthlyAttendanceResponse> getStudentMonthlyAttendance(
            @PathVariable String studentId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            Authentication authentication) {

        String trainerEmail = (authentication != null) ? authentication.getName() : null;
        return ResponseEntity.ok(
                attendanceService.getStudentMonthlyAttendance(studentId, month, year, trainerEmail));
    }

    @GetMapping("/history")
    public ResponseEntity<TodayAttendanceResponse> getAttendanceHistory(
            @RequestParam(required = false) String batchId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String sessionType,
            Authentication authentication) {

        String trainerEmail = (authentication != null) ? authentication.getName() : null;
        return ResponseEntity.ok(
                attendanceService.getAttendanceHistory(batchId, date, sessionType, trainerEmail));
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByBatch(
            @PathVariable String batchId) {

        return ResponseEntity.ok(
                attendanceService.getAttendanceByBatch(batchId));
    }
}