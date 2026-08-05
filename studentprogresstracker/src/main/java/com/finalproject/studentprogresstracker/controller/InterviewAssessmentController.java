package com.finalproject.studentprogresstracker.controller;

import com.finalproject.studentprogresstracker.dto.InterviewAssesementRequest;
import com.finalproject.studentprogresstracker.dto.InterviewAssesementResponse;
import com.finalproject.studentprogresstracker.entity.Interview;
import com.finalproject.studentprogresstracker.service.InterviewAssesementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interview-assessments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InterviewAssessmentController {

    private final InterviewAssesementService interviewAssessmentService;

    /**
     * Add Interview Assessment
     */
    @PostMapping("/add")
    public ResponseEntity<InterviewAssesementResponse> addInterviewAssessment(
            @Valid @RequestBody Interview interviewAssessment) {

        InterviewAssesementResponse response =
                interviewAssessmentService.addInterviewAssessment(interviewAssessment);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get All Interview Assessments
     */
    @GetMapping("/all")
    public ResponseEntity<List<InterviewAssesementResponse>> getAllAssessments() {

        return ResponseEntity.ok(
                interviewAssessmentService.getAllAssessments());
    }

    /**
     * Get Assessment By Id
     */
    @GetMapping("/{assessmentId}")
    public ResponseEntity<InterviewAssesementResponse> getAssessmentById(
            @PathVariable String assessmentId) {

        return ResponseEntity.ok(
                interviewAssessmentService.getAssessmentById(assessmentId));
    }

    /**
     * Update Interview Assessment
     */
    @PutMapping("/update/{assessmentId}")
    public ResponseEntity<InterviewAssesementResponse> updateAssessment(
            @PathVariable String assessmentId,
            @Valid @RequestBody InterviewAssesementRequest dto) {

        return ResponseEntity.ok(
                interviewAssessmentService.updateAssessment(assessmentId, dto));
    }

    /**
     * Delete Interview Assessment
     */
    @DeleteMapping("/delete/{assessmentId}")
    public ResponseEntity<String> deleteAssessment(
            @PathVariable String assessmentId) {

        return ResponseEntity.ok(
                interviewAssessmentService.deleteAssessment(assessmentId));
    }

    /**
     * Get Assessment By Candidate Id
     */
    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<InterviewAssesementResponse>> getByCandidate(
            @PathVariable String candidateId) {

        return ResponseEntity.ok(
                interviewAssessmentService.getByCandidate(candidateId));
    }

    /**
     * Get Assessment By Trainer Id
     */
    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<List<InterviewAssesementResponse>> getByTrainer(
            @PathVariable String trainerId) {

        return ResponseEntity.ok(
                interviewAssessmentService.getByTrainer(trainerId));
    }

    /**
     * Get Selected Students
     */
    @GetMapping("/selected")
    public ResponseEntity<List<InterviewAssesementResponse>> getSelectedStudents() {

        return ResponseEntity.ok(
                interviewAssessmentService.getSelectedStudents());
    }

}