package com.finalproject.studentprogresstracker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.dto.response.InterviewResponse;
import com.finalproject.studentprogresstracker.service.InterviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student/interviews")
@RequiredArgsConstructor
@CrossOrigin("*")
public class StudentInterviewController {

    private final InterviewService interviewService;

    @GetMapping("/{studentId}")
    public ResponseEntity<InterviewResponse> getInterview(
            @PathVariable String studentId) {

        return ResponseEntity.ok(
                interviewService.getInterviewByStudent(studentId));
    }

}