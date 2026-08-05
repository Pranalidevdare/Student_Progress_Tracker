package com.finalproject.studentprogresstracker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.entity.Attendance;
import com.finalproject.studentprogresstracker.service.AttendanceService;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    // Mark Attendance
    @PostMapping("/add")
    public ResponseEntity<Attendance> markAttendance(
            @RequestBody Attendance attendance) {

        return new ResponseEntity<>(
                attendanceService.markAttendance(attendance),
                HttpStatus.CREATED);
    }

    // Get All Attendance
    @GetMapping("/all")
    public ResponseEntity<List<Attendance>> getAllAttendance() {

        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    // Get Attendance By Id
    @GetMapping("/{attendanceId}")
    public ResponseEntity<Attendance> getAttendanceById(
            @PathVariable String attendanceId) {

        return ResponseEntity.ok(
                attendanceService.getAttendanceById(attendanceId));
    }

    // Get Attendance By Student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Attendance>> getAttendanceByStudent(
            @PathVariable String studentId) {

        return ResponseEntity.ok(
                attendanceService.getAttendanceByStudent(studentId));
    }

    // Get Attendance By Trainer
    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<List<Attendance>> getAttendanceByTrainer(
            @PathVariable String trainerId) {

        return ResponseEntity.ok(
                attendanceService.getAttendanceByTrainer(trainerId));
    }

    // Get Attendance By Batch
    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<Attendance>> getAttendanceByBatch(
            @PathVariable String batchId) {

        return ResponseEntity.ok(
                attendanceService.getAttendanceByBatch(batchId));
    }

    // Get Today's Attendance
    @GetMapping("/today")
    public ResponseEntity<List<Attendance>> getTodayAttendance() {

        return ResponseEntity.ok(
                attendanceService.getTodayAttendance());
    }

    // Update Attendance
    @PutMapping("/update/{attendanceId}")
    public ResponseEntity<Attendance> updateAttendance(
            @PathVariable String attendanceId,
            @RequestBody Attendance attendance) {

        return ResponseEntity.ok(
                attendanceService.updateAttendance(attendanceId, attendance));
    }

    // Delete Attendance
    @DeleteMapping("/delete/{attendanceId}")
    public ResponseEntity<String> deleteAttendance(
            @PathVariable String attendanceId) {

        return ResponseEntity.ok(
                attendanceService.deleteAttendance(attendanceId));
    }

}