package com.example.SPT.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.response.AttendanceResponse;
import com.example.SPT.dto.response.StudentPersonalAttendanceResponse;
import com.example.SPT.service.AttendanceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student/attendance")
@RequiredArgsConstructor
@CrossOrigin("*")
public class StudentAttendanceController {

    private final AttendanceService attendanceService;

    // Authenticated Student's Personal Attendance Summary & Records
    @GetMapping({"", "/me"})
    public ResponseEntity<StudentPersonalAttendanceResponse> getMyAttendance(
            Authentication authentication) {

        String userIdentifier = (authentication != null && authentication.getName() != null)
                ? authentication.getName()
                : "student@spt.com";

        return ResponseEntity.ok(
                attendanceService.getPersonalAttendance(userIdentifier));
    }

    // Authenticated Student's Raw Attendance Records
    @GetMapping("/records")
    public ResponseEntity<List<AttendanceResponse>> getMyAttendanceRecords(
            Authentication authentication) {

        String userIdentifier = (authentication != null && authentication.getName() != null)
                ? authentication.getName()
                : "student@spt.com";

        StudentPersonalAttendanceResponse res = attendanceService.getPersonalAttendance(userIdentifier);
        return ResponseEntity.ok(res.getRecords());
    }

    // Single student lookup with strict role security
    @GetMapping("/{studentId}")
    public ResponseEntity<StudentPersonalAttendanceResponse> getAttendanceByStudent(
            @PathVariable String studentId,
            Authentication authentication) {

        boolean isStaff = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_TRAINER"));

        // If caller is student, prevent ID tampering and return own attendance
        String targetIdentifier = isStaff
                ? studentId
                : ((authentication != null && authentication.getName() != null) ? authentication.getName() : studentId);

        return ResponseEntity.ok(
                attendanceService.getPersonalAttendance(targetIdentifier));
    }

}