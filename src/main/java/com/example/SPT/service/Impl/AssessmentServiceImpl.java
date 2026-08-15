package com.example.SPT.service.Impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.SPT.dto.request.AssessmentRequest;
import com.example.SPT.dto.request.AssessmentSubmissionRequest;
import com.example.SPT.dto.response.AssessmentResponse;
import com.example.SPT.dto.response.AssessmentStatsResponse;
import com.example.SPT.dto.response.AssessmentStudentDetailResponse;
import com.example.SPT.entity.AssessmentResult;
import com.example.SPT.entity.MonthlyAssessment;
import com.example.SPT.entity.Student;
import com.example.SPT.mapper.AssessmentMapper;
import com.example.SPT.repository.AssessmentResultRepository;
import com.example.SPT.repository.MonthlyAssessmentRepository;
import com.example.SPT.repository.StudentRepository;
import com.example.SPT.service.AssessmentService;
import com.example.SPT.util.FileUploadUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AssessmentServiceImpl implements AssessmentService {

    private final MonthlyAssessmentRepository assessmentRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final StudentRepository studentRepository;
    private final AssessmentMapper assessmentMapper;
    private final com.example.SPT.service.NotificationService notificationService;

    @Override
    public AssessmentResponse createAssessment(AssessmentRequest request) {
        if (request == null || request.getBatchId() == null || request.getBatchId().trim().isEmpty()) {
            throw new IllegalArgumentException("Batch ID is required for creating an assessment.");
        }

        // Validate date & time schedule (prevent past dates/times & validate start < end)
        validateAssessmentSchedule(request.getAssessmentDate(), request.getStartTime(), request.getEndTime());

        // Enforce 1-assessment-per-month per batch restriction
        java.time.LocalDate targetDate = request.getAssessmentDate() != null ? request.getAssessmentDate() : java.time.LocalDate.now();
        java.time.LocalDate startOfMonth = targetDate.withDayOfMonth(1);
        java.time.LocalDate endOfMonth = targetDate.withDayOfMonth(targetDate.lengthOfMonth());

        List<MonthlyAssessment> existingInMonth = assessmentRepository.findByBatchIdAndAssessmentDateBetween(
                request.getBatchId(), startOfMonth, endOfMonth);

        if (existingInMonth != null && !existingInMonth.isEmpty()) {
            throw new IllegalArgumentException("Only one assessment can be scheduled per month for this batch. An assessment already exists for this month.");
        }

        String qSource = request.getQuestionSource() != null ? request.getQuestionSource().toUpperCase() : "MANUAL";
        if ("MANUAL".equalsIgnoreCase(qSource)) {
            if (request.getQuestions() == null || request.getQuestions().isEmpty()) {
                throw new IllegalArgumentException("At least one question is required for manual assessment creation.");
            }
            int calculatedTotal = 0;
            int qNum = 1;
            for (com.example.SPT.entity.AssignmentQuestion q : request.getQuestions()) {
                if (q.getQuestionText() == null || q.getQuestionText().trim().isEmpty()) {
                    throw new IllegalArgumentException("Question text cannot be empty.");
                }
                if (q.getMaxMarks() == null || q.getMaxMarks() <= 0) {
                    throw new IllegalArgumentException("Question maximum marks must be greater than zero.");
                }
                if (q.getQuestionId() == null || q.getQuestionId().trim().isEmpty()) {
                    q.setQuestionId(java.util.UUID.randomUUID().toString());
                }
                q.setQuestionNumber(qNum++);
                q.setQuestionType(q.getQuestionType() != null ? q.getQuestionType() : "DESCRIPTIVE");
                calculatedTotal += q.getMaxMarks();
            }
            request.setTotalMarks(calculatedTotal);
            if (request.getAttachmentUrl() == null) request.setAttachmentUrl("");
        } else {
            qSource = "PDF";
            if (request.getAttachmentUrl() == null || request.getAttachmentUrl().trim().isEmpty()) {
                throw new IllegalArgumentException("Question PDF document is required for PDF assessment creation.");
            }
            request.setQuestions(null);
        }

        MonthlyAssessment assessment = MonthlyAssessment.builder()
                .trainerId(request.getTrainerId())
                .batchId(request.getBatchId())
                .title(request.getTitle())
                .subject(request.getSubject())
                .assessmentType(request.getAssessmentType() != null ? request.getAssessmentType() : "QUIZ")
                .description(request.getDescription())
                .attachmentUrl(request.getAttachmentUrl())
                .questionSource(qSource)
                .questions(request.getQuestions())
                .totalMarks(request.getTotalMarks())
                .durationInMinutes(request.getDurationInMinutes())
                .assessmentDate(request.getAssessmentDate())
                .startTime(request.getStartTime() != null ? request.getStartTime() : "10:00 AM")
                .endTime(request.getEndTime() != null ? request.getEndTime() : "11:00 AM")
                .lastSubmissionDate(request.getLastSubmissionDate())
                .status(request.getStatus() != null ? request.getStatus() : "UPCOMING")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();


        MonthlyAssessment savedAssessment = assessmentRepository.save(assessment);

        // Notify batch students
        try {
            String timeStr = (savedAssessment.getStartTime() != null ? savedAssessment.getStartTime() : "10:00 AM")
                    + " - " + (savedAssessment.getEndTime() != null ? savedAssessment.getEndTime() : "11:00 AM");
            String dateStr = savedAssessment.getAssessmentDate() != null ? savedAssessment.getAssessmentDate().toString() : "";
            String msg = "A new assessment '" + savedAssessment.getTitle() + "' has been scheduled."
                    + (dateStr.isEmpty() ? "" : " Date: " + dateStr)
                    + " Time: " + timeStr;

            notificationService.createBatchNotifications(
                savedAssessment.getTrainerId(),
                savedAssessment.getBatchId(),
                "New Assessment Scheduled",
                msg,
                "ASSESSMENT_CREATED",
                "ASSESSMENT",
                savedAssessment.getId()
            );
        } catch (Exception e) {
            System.err.println("Failed to send assessment notifications: " + e.getMessage());
        }

        return assessmentMapper.toResponse(savedAssessment);
    }

    @Override
    public AssessmentResponse updateAssessment(String id, AssessmentRequest request) {
        MonthlyAssessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assessment not found with id : " + id));

        if ("COMPLETED".equalsIgnoreCase(assessment.getStatus())) {
            throw new IllegalArgumentException("Completed assessments cannot be edited.");
        }

        // BACKEND EDIT RESTRICTION: Block update if student attempts exist
        List<AssessmentResult> attempts = assessmentResultRepository.findByAssessmentId(id);
        if (attempts != null && !attempts.isEmpty()) {
            throw new IllegalArgumentException("Assessment cannot be modified because students have already attempted it.");
        }

        validateAssessmentSchedule(request.getAssessmentDate(), request.getStartTime(), request.getEndTime());

        String qSource = request.getQuestionSource() != null ? request.getQuestionSource().toUpperCase() : "MANUAL";
        if ("MANUAL".equalsIgnoreCase(qSource)) {
            if (request.getQuestions() == null || request.getQuestions().isEmpty()) {
                throw new IllegalArgumentException("At least one question is required for manual assessment creation.");
            }
            int calculatedTotal = 0;
            int qNum = 1;
            for (com.example.SPT.entity.AssignmentQuestion q : request.getQuestions()) {
                if (q.getQuestionText() == null || q.getQuestionText().trim().isEmpty()) {
                    throw new IllegalArgumentException("Question text cannot be empty.");
                }
                if (q.getMaxMarks() == null || q.getMaxMarks() <= 0) {
                    throw new IllegalArgumentException("Question maximum marks must be greater than zero.");
                }
                if (q.getQuestionId() == null || q.getQuestionId().trim().isEmpty()) {
                    q.setQuestionId(java.util.UUID.randomUUID().toString());
                }
                q.setQuestionNumber(qNum++);
                q.setQuestionType(q.getQuestionType() != null ? q.getQuestionType() : "DESCRIPTIVE");
                calculatedTotal += q.getMaxMarks();
            }
            request.setTotalMarks(calculatedTotal);
        } else {
            qSource = "PDF";
            request.setQuestions(null);
        }

        assessment.setTrainerId(request.getTrainerId());
        assessment.setBatchId(request.getBatchId());
        assessment.setTitle(request.getTitle());
        assessment.setSubject(request.getSubject());
        if (request.getAssessmentType() != null) {
            assessment.setAssessmentType(request.getAssessmentType());
        }
        assessment.setDescription(request.getDescription());
        assessment.setQuestionSource(qSource);
        assessment.setQuestions(request.getQuestions());
        if (request.getAttachmentUrl() != null) {
            assessment.setAttachmentUrl(request.getAttachmentUrl());
        }
        assessment.setTotalMarks(request.getTotalMarks());
        assessment.setDurationInMinutes(request.getDurationInMinutes());
        assessment.setAssessmentDate(request.getAssessmentDate());
        assessment.setLastSubmissionDate(request.getLastSubmissionDate());
        if (request.getStatus() != null) {
            assessment.setStatus(request.getStatus());
        }
        assessment.setUpdatedAt(LocalDateTime.now());

        MonthlyAssessment updatedAssessment = assessmentRepository.save(assessment);

        return assessmentMapper.toResponse(updatedAssessment);
    }

    @Override
    public void deleteAssessment(String id) {
        MonthlyAssessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assessment not found with id : " + id));

        assessmentRepository.delete(assessment);
    }

    @Override
    public List<AssessmentResponse> getAssessmentsByBatch(String batchId) {
        return assessmentRepository.findByBatchId(batchId)
                .stream()
                .map(assessmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void submitAssessment(AssessmentSubmissionRequest request) {
        AssessmentResult result = AssessmentResult.builder()
                .assessmentId(request.getAssessmentId())
                .studentId(request.getStudentId())
                .submittedAt(LocalDateTime.now())
                .resultStatus("PENDING")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        assessmentResultRepository.save(result);
    }

    @Override
    public String uploadAssessmentDocument(MultipartFile file) {
        try {
            return FileUploadUtil.uploadFile(file);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload assessment document: " + e.getMessage());
        }
    }

    @Override
    public AssessmentResult evaluateSubmission(String submissionId, Integer marks, String remarks) {
        AssessmentResult result = assessmentResultRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission attempt not found with id: " + submissionId));

        // BACKEND EVALUATION RESTRICTION: Block re-evaluation
        if ("EVALUATED".equalsIgnoreCase(result.getResultStatus())) {
            throw new IllegalArgumentException("Assessment attempt has already been evaluated.");
        }

        result.setObtainedMarks(marks);
        result.setTrainerRemarks(remarks);
        result.setResultStatus("EVALUATED");
        if (result.getTotalMarks() != null && result.getTotalMarks() > 0 && marks != null) {
            result.setPercentage(Double.valueOf(Math.round((marks * 100.0 / result.getTotalMarks()) * 10.0) / 10.0));
        }
        result.setUpdatedAt(LocalDateTime.now());
        return assessmentResultRepository.save(result);
    }

    @Override
    public AssessmentResponse getAssessmentById(String id) {
        MonthlyAssessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assessment not found with id: " + id));
        return assessmentMapper.toResponse(assessment);
    }

    @Override
    public AssessmentStatsResponse getAssessmentStatisticsById(String assessmentId, String batchId) {
        MonthlyAssessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found with id: " + assessmentId));

        String effectiveBatchId = (batchId != null && !batchId.trim().isEmpty()) ? batchId : assessment.getBatchId();
        List<Student> students = studentRepository.findByBatchId(effectiveBatchId);
        long totalStudents = students.size();

        List<AssessmentResult> results = assessmentResultRepository.findByAssessmentId(assessmentId);
        long attemptedCount = results.size();
        long notAttemptedCount = Math.max(0, totalStudents - attemptedCount);

        long evaluatedCount = 0;
        long pendingEvalCount = 0;
        long passedCount = 0;
        long failedCount = 0;

        for (AssessmentResult res : results) {
            if ("EVALUATED".equalsIgnoreCase(res.getResultStatus())) {
                evaluatedCount++;
                int passMark = (res.getTotalMarks() != null) ? (int) Math.round(res.getTotalMarks() * 0.4) : 20;
                if (res.getObtainedMarks() != null && res.getObtainedMarks() >= passMark) {
                    passedCount++;
                } else {
                    failedCount++;
                }
            } else {
                pendingEvalCount++;
            }
        }

        double rate = totalStudents > 0 ? (attemptedCount * 100.0) / totalStudents : 0.0;
        double roundedRate = Math.round(rate * 10.0) / 10.0;

        return AssessmentStatsResponse.builder()
                .assessmentId(assessmentId)
                .assessmentTitle(assessment.getTitle())
                .totalStudents(totalStudents)
                .attemptedCount(attemptedCount)
                .notAttemptedCount(notAttemptedCount)
                .evaluatedCount(evaluatedCount)
                .pendingEvaluationCount(pendingEvalCount)
                .passedCount(passedCount)
                .failedCount(failedCount)
                .attemptRate(roundedRate)
                .build();
    }

    @Override
    public List<AssessmentStudentDetailResponse> getAssessmentStudentDetails(String assessmentId, String batchId) {
        MonthlyAssessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found with id: " + assessmentId));

        String effectiveBatchId = (batchId != null && !batchId.trim().isEmpty()) ? batchId : assessment.getBatchId();
        List<Student> students = studentRepository.findByBatchId(effectiveBatchId);
        List<AssessmentResult> results = assessmentResultRepository.findByAssessmentId(assessmentId);

        Map<String, AssessmentResult> resultMap = results.stream()
                .collect(Collectors.toMap(AssessmentResult::getStudentId, r -> r, (r1, r2) -> r1));

        List<AssessmentStudentDetailResponse> list = new ArrayList<>();
        int maxMarks = assessment.getTotalMarks() != null ? assessment.getTotalMarks() : 50;

        for (Student s : students) {
            AssessmentResult res = resultMap.get(s.getId());
            if (res != null) {
                boolean isEvaluated = "EVALUATED".equalsIgnoreCase(res.getResultStatus());
                int marks = res.getObtainedMarks() != null ? res.getObtainedMarks() : 0;
                double pct = res.getPercentage() != null ? res.getPercentage() : Math.round((marks * 100.0 / maxMarks) * 10.0) / 10.0;
                int passMark = (int) Math.round(maxMarks * 0.4);
                String resultStr = isEvaluated ? (marks >= passMark ? "PASSED" : "FAILED") : "PENDING";

                list.add(AssessmentStudentDetailResponse.builder()
                        .submissionId(res.getId())
                        .assessmentId(assessmentId)
                        .studentId(s.getId())
                        .studentName(s.getFirstName() + " " + s.getLastName())
                        .studentEmail(s.getEmail())
                        .attemptStatus("ATTEMPTED")
                        .submittedAt(res.getSubmittedAt())
                        .evaluationStatus(isEvaluated ? "EVALUATED" : "PENDING_EVALUATION")
                        .marksObtained(marks)
                        .maxMarks(maxMarks)
                        .percentage(pct)
                        .resultStatus(resultStr)
                        .studentAnswers(res.getStudentAnswers())
                        .answerSheetUrl(res.getAnswerSheetUrl())
                        .trainerRemarks(res.getTrainerRemarks())
                        .build());
            } else {
                list.add(AssessmentStudentDetailResponse.builder()
                        .submissionId(null)
                        .assessmentId(assessmentId)
                        .studentId(s.getId())
                        .studentName(s.getFirstName() + " " + s.getLastName())
                        .studentEmail(s.getEmail())
                        .attemptStatus("NOT_ATTEMPTED")
                        .submittedAt(null)
                        .evaluationStatus("NOT_EVALUATED")
                        .marksObtained(0)
                        .maxMarks(maxMarks)
                        .percentage(0.0)
                        .resultStatus("NOT_EVALUATED")
                        .studentAnswers(null)
                        .answerSheetUrl(null)
                        .trainerRemarks(null)
                        .build());
            }
        }
        return list;
    }

    @Override
    public AssessmentStudentDetailResponse getStudentAnswers(String assessmentId, String studentId) {
        List<AssessmentStudentDetailResponse> details = getAssessmentStudentDetails(assessmentId, null);
        return details.stream()
                .filter(d -> d.getStudentId().equals(studentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Student attempt not found for assessment: " + assessmentId));
    }

    @Override
    public AssessmentStudentDetailResponse getEvaluationDetails(String submissionId) {
        AssessmentResult result = assessmentResultRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Evaluation record not found for submission ID: " + submissionId));

        MonthlyAssessment assessment = assessmentRepository.findById(result.getAssessmentId()).orElse(null);
        Student student = studentRepository.findById(result.getStudentId()).orElse(null);

        String sName = (student != null) ? (student.getFirstName() + " " + student.getLastName()) : (result.getStudentName() != null ? result.getStudentName() : "Student");
        String sEmail = (student != null) ? student.getEmail() : "";

        int maxMarks = result.getTotalMarks() != null ? result.getTotalMarks() : (assessment != null && assessment.getTotalMarks() != null ? assessment.getTotalMarks() : 50);
        int marks = result.getObtainedMarks() != null ? result.getObtainedMarks() : 0;
        double pct = result.getPercentage() != null ? result.getPercentage() : Math.round((marks * 100.0 / maxMarks) * 10.0) / 10.0;
        int passMark = (int) Math.round(maxMarks * 0.4);
        String resultStr = "EVALUATED".equalsIgnoreCase(result.getResultStatus()) ? (marks >= passMark ? "PASSED" : "FAILED") : "PENDING";

        return AssessmentStudentDetailResponse.builder()
                .submissionId(result.getId())
                .assessmentId(result.getAssessmentId())
                .studentId(result.getStudentId())
                .studentName(sName)
                .studentEmail(sEmail)
                .attemptStatus("ATTEMPTED")
                .submittedAt(result.getSubmittedAt())
                .evaluationStatus("EVALUATED")
                .marksObtained(marks)
                .maxMarks(maxMarks)
                .percentage(pct)
                .resultStatus(resultStr)
                .studentAnswers(result.getStudentAnswers())
                .answerSheetUrl(result.getAnswerSheetUrl())
                .trainerRemarks(result.getTrainerRemarks())
                .build();
    }

    private void validateAssessmentSchedule(java.time.LocalDate assessmentDate, String startTimeStr, String endTimeStr) {
        java.time.ZoneId zoneId = java.time.ZoneId.of("Asia/Kolkata");
        java.time.LocalDate today = java.time.LocalDate.now(zoneId);
        java.time.LocalDateTime now = java.time.LocalDateTime.now(zoneId);

        if (assessmentDate == null) {
            throw new IllegalArgumentException("Assessment date is required.");
        }

        if (assessmentDate.isBefore(today)) {
            throw new IllegalArgumentException("Assessment date cannot be in the past.");
        }

        java.time.LocalDateTime startDateTime = parseDateTime(assessmentDate, startTimeStr != null ? startTimeStr : "10:00 AM");
        if (startDateTime != null) {
            if (startDateTime.isBefore(now) || startDateTime.isEqual(now)) {
                if (assessmentDate.isBefore(today)) {
                    throw new IllegalArgumentException("Assessment date cannot be in the past.");
                } else {
                    throw new IllegalArgumentException("Assessment start time cannot be in the past.");
                }
            }
        }

        java.time.LocalDateTime endDateTime = parseDateTime(assessmentDate, endTimeStr != null ? endTimeStr : "11:00 AM");
        if (startDateTime != null && endDateTime != null) {
            if (!endDateTime.isAfter(startDateTime)) {
                throw new IllegalArgumentException("Assessment end time must be after the start time.");
            }
        }
    }

    private java.time.LocalDateTime parseDateTime(java.time.LocalDate date, String timeStr) {
        if (date == null || timeStr == null || timeStr.trim().isEmpty()) {
            return null;
        }
        String cleanedTime = timeStr.trim().toUpperCase();
        java.time.LocalTime time = null;

        String[] patterns = {"h:mm a", "hh:mm a", "H:mm", "HH:mm", "h:mma", "hh:mma"};
        for (String pattern : patterns) {
            try {
                time = java.time.LocalTime.parse(cleanedTime, java.time.format.DateTimeFormatter.ofPattern(pattern, java.util.Locale.ENGLISH));
                break;
            } catch (Exception ignored) {
            }
        }

        if (time != null) {
            return java.time.LocalDateTime.of(date, time);
        }
        return null;
    }
}