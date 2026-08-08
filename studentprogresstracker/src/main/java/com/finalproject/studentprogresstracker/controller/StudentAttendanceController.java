package com.finalproject.studentprogresstracker.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.dto.response.AttendanceResponse;
import com.finalproject.studentprogresstracker.service.AttendanceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student/attendance")
@RequiredArgsConstructor
@CrossOrigin("*")
public class StudentAttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/{studentId}")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByStudent(
            @PathVariable String studentId) {

        return ResponseEntity.ok(
                attendanceService.getAttendanceByStudent(studentId));
    }

}