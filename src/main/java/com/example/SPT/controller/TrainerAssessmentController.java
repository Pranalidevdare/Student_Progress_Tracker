package com.example.SPT.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.SPT.dto.request.AssessmentRequest;
import com.example.SPT.dto.response.AssessmentResponse;
import com.example.SPT.dto.response.AssessmentStatsResponse;
import com.example.SPT.dto.response.AssessmentStudentDetailResponse;
import com.example.SPT.entity.AssessmentResult;
import com.example.SPT.service.AssessmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trainer/assessments")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TrainerAssessmentController {

    private final AssessmentService assessmentService;

    @PostMapping
    public ResponseEntity<AssessmentResponse> createAssessment(
            @Valid @RequestBody AssessmentRequest request) {

        return new ResponseEntity<>(
                assessmentService.createAssessment(request),
                HttpStatus.CREATED);
    }

    @PostMapping("/upload-document")
    public ResponseEntity<Map<String, String>> uploadDocument(
            @RequestParam("file") MultipartFile file) {

        String filePath = assessmentService.uploadAssessmentDocument(file);
        Map<String, String> response = new HashMap<>();
        response.put("attachmentUrl", "/" + filePath.replace("\\", "/"));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssessmentResponse> updateAssessment(
            @PathVariable String id,
            @Valid @RequestBody AssessmentRequest request) {

        return ResponseEntity.ok(
                assessmentService.updateAssessment(id, request));
    }

    @PutMapping("/submissions/{submissionId}/evaluate")
    public ResponseEntity<AssessmentResult> evaluateSubmission(
            @PathVariable String submissionId,
            @RequestBody Map<String, Object> body) {

        Integer marks = body.get("marksObtained") != null ? Integer.parseInt(body.get("marksObtained").toString()) : 0;
        String remarks = body.get("trainerFeedback") != null ? body.get("trainerFeedback").toString() : "";

        return ResponseEntity.ok(
                assessmentService.evaluateSubmission(submissionId, marks, remarks));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAssessment(
            @PathVariable String id) {

        assessmentService.deleteAssessment(id);

        return ResponseEntity.ok("Assessment deleted successfully.");
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<AssessmentResponse>> getAssessments(
            @PathVariable String batchId) {

        return ResponseEntity.ok(
                assessmentService.getAssessmentsByBatch(batchId));
    }

    @GetMapping("/{assessmentId}")
    public ResponseEntity<AssessmentResponse> getAssessmentById(
            @PathVariable String assessmentId) {

        return ResponseEntity.ok(
                assessmentService.getAssessmentById(assessmentId));
    }

    @GetMapping("/{assessmentId}/statistics")
    public ResponseEntity<AssessmentStatsResponse> getAssessmentStatistics(
            @PathVariable String assessmentId,
            @RequestParam(required = false) String batchId) {

        return ResponseEntity.ok(
                assessmentService.getAssessmentStatisticsById(assessmentId, batchId));
    }

    @GetMapping("/{assessmentId}/students")
    public ResponseEntity<List<AssessmentStudentDetailResponse>> getAssessmentStudents(
            @PathVariable String assessmentId,
            @RequestParam(required = false) String batchId) {

        return ResponseEntity.ok(
                assessmentService.getAssessmentStudentDetails(assessmentId, batchId));
    }

    @GetMapping("/{assessmentId}/students/{studentId}/answers")
    public ResponseEntity<AssessmentStudentDetailResponse> getStudentAnswers(
            @PathVariable String assessmentId,
            @PathVariable String studentId) {

        return ResponseEntity.ok(
                assessmentService.getStudentAnswers(assessmentId, studentId));
    }

    @GetMapping("/submissions/{submissionId}/evaluation")
    public ResponseEntity<AssessmentStudentDetailResponse> getEvaluationDetails(
            @PathVariable String submissionId) {

        return ResponseEntity.ok(
                assessmentService.getEvaluationDetails(submissionId));
    }
}