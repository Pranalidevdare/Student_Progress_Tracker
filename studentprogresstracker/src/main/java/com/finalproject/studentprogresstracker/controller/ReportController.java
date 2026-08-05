package com.finalproject.studentprogresstracker.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.entity.Assignment;
import com.finalproject.studentprogresstracker.entity.Attendance;
import com.finalproject.studentprogresstracker.entity.Feedback;
import com.finalproject.studentprogresstracker.entity.GuestSession;
import com.finalproject.studentprogresstracker.entity.Notice;
import com.finalproject.studentprogresstracker.entity.Performance;
import com.finalproject.studentprogresstracker.entity.StudyMaterial;
import com.finalproject.studentprogresstracker.entity.Test;
import com.finalproject.studentprogresstracker.service.ReportService;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    // Attendance Report
    @GetMapping("/attendance")
    public ResponseEntity<List<Attendance>> attendanceReport() {

        return ResponseEntity.ok(
                reportService.attendanceReport());
    }

    // Assignment Report
    @GetMapping("/assignments")
    public ResponseEntity<List<Assignment>> assignmentReport() {

        return ResponseEntity.ok(
                reportService.assignmentReport());
    }

    // Study Material Report
    @GetMapping("/study-materials")
    public ResponseEntity<List<StudyMaterial>> studyMaterialReport() {

        return ResponseEntity.ok(
                reportService.studyMaterialReport());
    }

    // Test Report
    @GetMapping("/tests")
    public ResponseEntity<List<Test>> testReport() {

        return ResponseEntity.ok(
                reportService.testReport());
    }

    // Performance Report
    @GetMapping("/performance")
    public ResponseEntity<List<Performance>> performanceReport() {

        return ResponseEntity.ok(
                reportService.performanceReport());
    }

    // Feedback Report
    @GetMapping("/feedback")
    public ResponseEntity<List<Feedback>> feedbackReport() {

        return ResponseEntity.ok(
                reportService.feedbackReport());
    }

    // Notice Report
    @GetMapping("/notices")
    public ResponseEntity<List<Notice>> noticeReport() {

        return ResponseEntity.ok(
                reportService.noticeReport());
    }

    // Guest Session Report
    @GetMapping("/guest-sessions")
    public ResponseEntity<List<GuestSession>> guestSessionReport() {

        return ResponseEntity.ok(
                reportService.guestSessionReport());
    }

    // Dashboard Statistics Report
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Long>> dashboardReport() {

        return ResponseEntity.ok(
                reportService.dashboardReport());
    }

}