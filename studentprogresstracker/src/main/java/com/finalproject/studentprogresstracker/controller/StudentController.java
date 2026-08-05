package com.finalproject.studentprogresstracker.controller;

import com.finalproject.studentprogresstracker.dto.DashboardResponseDto;
import com.finalproject.studentprogresstracker.dto.StudentProfileResponseDto;
import com.finalproject.studentprogresstracker.dto.UpdateStudentProfileRequestDto;
import com.finalproject.studentprogresstracker.entity.Assignment;
import com.finalproject.studentprogresstracker.entity.Attendance;
import com.finalproject.studentprogresstracker.entity.Feedback;
import com.finalproject.studentprogresstracker.entity.GuestSession;
import com.finalproject.studentprogresstracker.entity.Notice;
import com.finalproject.studentprogresstracker.entity.Performance;
import com.finalproject.studentprogresstracker.entity.StudyMaterial;
import com.finalproject.studentprogresstracker.entity.Test;
import com.finalproject.studentprogresstracker.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * REST Controller for Student Module.
 */
@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    /**
     * Dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponseDto> getDashboard(
            Principal principal) {

        return ResponseEntity.ok(
                studentService.getDashboard(principal.getName()));
    }

    /**
     * Student Profile
     */
    @GetMapping("/profile")
    public ResponseEntity<StudentProfileResponseDto> getProfile(
            Principal principal) {

        return ResponseEntity.ok(
                studentService.getProfile(principal.getName()));
    }

    /**
     * Update Profile
     */
    @PutMapping("/profile")
    public ResponseEntity<StudentProfileResponseDto> updateProfile(
            Principal principal,
            @Valid @RequestBody UpdateStudentProfileRequestDto request) {

        return ResponseEntity.ok(
                studentService.updateProfile(principal.getName(), request));
    }

    /**
     * Attendance
     */
    @GetMapping("/attendance")
    public ResponseEntity<List<Attendance>> getAttendance(
            Principal principal) {

        return ResponseEntity.ok(
                studentService.getAttendance(principal.getName()));
    }

    /**
     * Assignments
     */
    @GetMapping("/assignments")
    public ResponseEntity<List<Assignment>> getAssignments(
            Principal principal) {

        return ResponseEntity.ok(
                studentService.getAssignments(principal.getName()));
    }

    /**
     * Study Materials
     */
    @GetMapping("/materials")
    public ResponseEntity<List<StudyMaterial>> getStudyMaterials() {

        return ResponseEntity.ok(
                studentService.getStudyMaterials());
    }

    /**
     * Upcoming Tests
     */
    @GetMapping("/tests")
    public ResponseEntity<List<Test>> getTests() {

        return ResponseEntity.ok(
                studentService.getUpcomingTests());
    }

    /**
     * Performance
     */
    @GetMapping("/performance")
    public ResponseEntity<Performance> getPerformance(
            Principal principal) {

        return ResponseEntity.ok(
                studentService.getPerformance(principal.getName()));
    }

    /**
     * Notices
     */
    @GetMapping("/notices")
    public ResponseEntity<List<Notice>> getNotices() {

        return ResponseEntity.ok(
                studentService.getNotices());
    }

    /**
     * Guest Sessions
     */
    @GetMapping("/guest-sessions")
    public ResponseEntity<List<GuestSession>> getGuestSessions() {

        return ResponseEntity.ok(
                studentService.getGuestSessions());
    }

    /**
     * Submit Feedback
     */
    @PostMapping("/feedback")
    public ResponseEntity<Feedback> submitFeedback(
            @RequestBody Feedback feedback) {

        return ResponseEntity.ok(
                studentService.submitFeedback(feedback));
    }

    /**
     * View Own Feedback
     */
    @GetMapping("/feedback")
    public ResponseEntity<List<Feedback>> getMyFeedback(
            Principal principal) {

        return ResponseEntity.ok(
                studentService.getMyFeedback(principal.getName()));
    }

}