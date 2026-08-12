package com.example.SPT.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.response.InterviewResponse;
import com.example.SPT.service.InterviewService;

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