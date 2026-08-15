package com.example.SPT.service.Impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.SPT.dto.request.AssignmentRequest;
import com.example.SPT.dto.request.AssignmentSubmissionRequest;
import com.example.SPT.dto.request.EvaluationRequest;
import com.example.SPT.dto.request.TrainerBatchSwitchRequest;
import com.example.SPT.dto.response.AssignmentResponse;
import com.example.SPT.dto.response.AssignmentSubmissionDetailResponse;
import com.example.SPT.dto.response.TrainerAssignmentStatsResponse;
import com.example.SPT.dto.response.TrainerResponse;
import com.example.SPT.entity.Assignment;
import com.example.SPT.entity.AssignmentSubmission;
import com.example.SPT.entity.Batch;
import com.example.SPT.entity.Student;
import com.example.SPT.entity.Trainer;
import com.example.SPT.mapper.AssignmentMapper;
import com.example.SPT.mapper.TrainerMapper;
import com.example.SPT.repository.AssignmentRepository;
import com.example.SPT.repository.AssignmentSubmissionRepository;
import com.example.SPT.repository.BatchRepository;
import com.example.SPT.repository.StudentRepository;
import com.example.SPT.repository.TrainerRepository;
import com.example.SPT.repository.UserRepository;
import com.example.SPT.service.AssignmentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AssignmentServiceImpl implements AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final StudentRepository studentRepository;
    private final TrainerRepository trainerRepository;
    private final UserRepository userRepository;
    private final BatchRepository batchRepository;
    private final AssignmentMapper assignmentMapper;
    private final TrainerMapper trainerMapper;
    private final com.example.SPT.service.NotificationService notificationService;

    @Override
    public AssignmentResponse createAssignment(AssignmentRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Assignment details are required.");
        }

        validateAssignmentDates(request.getAssignedDate(), request.getDueDate());

        String qSource = request.getQuestionSource() != null ? request.getQuestionSource().toUpperCase() : "PDF";
        if ("MANUAL".equalsIgnoreCase(qSource)) {
            if (request.getQuestions() == null || request.getQuestions().isEmpty()) {
                throw new IllegalArgumentException("At least one question is required for manual assignment creation.");
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
                throw new IllegalArgumentException("Question PDF document is required for PDF assignment creation.");
            }
        }

        Assignment assignment = Assignment.builder()
                .trainerId(request.getTrainerId())
                .batchId(request.getBatchId())
                .title(request.getTitle())
                .description(request.getDescription())
                .subject(request.getSubject())
                .questionSource(qSource)
                .questions(request.getQuestions())
                .totalMarks(request.getTotalMarks())
                .assignedDate(request.getAssignedDate())
                .dueDate(request.getDueDate())
                .attachmentUrl(request.getAttachmentUrl())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Assignment savedAssignment = assignmentRepository.save(assignment);
        AssignmentResponse response = assignmentMapper.toResponse(savedAssignment);
        enrichAssignmentResponseStats(response, savedAssignment.getBatchId(), savedAssignment.getDueDate());

        // Notify batch students
        try {
            notificationService.createBatchNotifications(
                savedAssignment.getTrainerId(),
                savedAssignment.getBatchId(),
                "New Assignment Added",
                "A new assignment '" + savedAssignment.getTitle() + "' has been added.",
                "ASSIGNMENT_CREATED",
                "ASSIGNMENT",
                savedAssignment.getId()
            );
        } catch (Exception e) {
            System.err.println("Failed to send assignment notifications: " + e.getMessage());
        }

        return response;
    }

    @Override
    public AssignmentResponse updateAssignment(String id, AssignmentRequest request) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id : " + id));

        validateAssignmentDates(request.getAssignedDate(), request.getDueDate());

        String qSource = request.getQuestionSource() != null ? request.getQuestionSource().toUpperCase() : "PDF";
        if ("MANUAL".equalsIgnoreCase(qSource)) {
            if (request.getQuestions() == null || request.getQuestions().isEmpty()) {
                throw new IllegalArgumentException("At least one question is required for manual assignment creation.");
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
        }

        assignment.setTrainerId(request.getTrainerId());
        assignment.setBatchId(request.getBatchId());
        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setSubject(request.getSubject());
        assignment.setQuestionSource(qSource);
        assignment.setQuestions(request.getQuestions());
        assignment.setTotalMarks(request.getTotalMarks());
        assignment.setAssignedDate(request.getAssignedDate());
        assignment.setDueDate(request.getDueDate());
        if (request.getAttachmentUrl() != null) {
            assignment.setAttachmentUrl(request.getAttachmentUrl());
        }
        if (request.getStatus() != null) {
            assignment.setStatus(request.getStatus());
        }
        assignment.setUpdatedAt(LocalDateTime.now());

        Assignment updatedAssignment = assignmentRepository.save(assignment);
        AssignmentResponse response = assignmentMapper.toResponse(updatedAssignment);
        enrichAssignmentResponseStats(response, updatedAssignment.getBatchId(), updatedAssignment.getDueDate());
        return response;
    }

    @Override
    public void deleteAssignment(String id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id : " + id));

        assignmentRepository.delete(assignment);
    }

    @Override
    public List<AssignmentResponse> getAssignmentsByBatch(String batchId) {
        List<Assignment> assignments = assignmentRepository.findByBatchId(batchId);
        return assignments.stream()
                .map(assignment -> {
                    AssignmentResponse resp = assignmentMapper.toResponse(assignment);
                    enrichAssignmentResponseStats(resp, batchId, assignment.getDueDate());
                    return resp;
                })
                .collect(Collectors.toList());
    }

    @Override
    public void submitAssignment(AssignmentSubmissionRequest request) {
        if (request == null || request.getAssignmentId() == null || request.getStudentId() == null) {
            throw new IllegalArgumentException("Assignment ID and Student ID are required.");
        }

        List<AssignmentSubmission> existingList = assignmentSubmissionRepository.findByAssignmentId(request.getAssignmentId());
        AssignmentSubmission submission = existingList.stream()
                .filter(s -> request.getStudentId().equals(s.getStudentId()))
                .findFirst()
                .orElse(null);

        boolean isDraft = "DRAFT".equalsIgnoreCase(request.getSubmissionStatus());

        if (submission == null) {
            submission = AssignmentSubmission.builder()
                    .assignmentId(request.getAssignmentId())
                    .studentId(request.getStudentId())
                    .createdAt(LocalDateTime.now())
                    .build();
        } else if ("SUBMITTED".equalsIgnoreCase(submission.getSubmissionStatus()) || "EVALUATED".equalsIgnoreCase(submission.getStatus())) {
            if (!isDraft) {
                throw new IllegalArgumentException("Assignment has already been submitted and cannot be modified.");
            }
        }

        Assignment assignment = assignmentRepository.findById(request.getAssignmentId()).orElse(null);
        if (assignment != null) {
            submission.setAssignmentTitle(assignment.getTitle());
            submission.setBatchId(assignment.getBatchId());
            submission.setTrainerId(assignment.getTrainerId());
        }

        Student student = studentRepository.findById(request.getStudentId()).orElse(null);
        if (student != null) {
            submission.setStudentName(student.getFirstName() + " " + student.getLastName());
        }

        submission.setSubmissionFileUrl(request.getSubmissionFileUrl());
        submission.setSubmissionRemarks(request.getSubmissionRemarks());
        submission.setQuestionAnswers(request.getQuestionAnswers());
        submission.setSubmissionStatus(isDraft ? "DRAFT" : "SUBMITTED");
        submission.setUpdatedAt(LocalDateTime.now());

        if (isDraft) {
            submission.setStatus("DRAFT");
        } else {
            submission.setSubmittedAt(LocalDateTime.now());
            submission.setStatus("PENDING");
        }

        assignmentSubmissionRepository.save(submission);
    }


    @Override
    public TrainerAssignmentStatsResponse getAssignmentStatistics(String batchId) {
        List<Assignment> assignments = assignmentRepository.findByBatchId(batchId);
        List<Student> students = studentRepository.findByBatchId(batchId);
        long totalStudents = students.size();

        long totalAssignments = assignments.size();
        long totalSubmitted = 0;
        long totalEvaluated = 0;
        long pendingEvaluation = 0;

        for (Assignment assignment : assignments) {
            List<AssignmentSubmission> submissions = assignmentSubmissionRepository.findByAssignmentId(assignment.getId());
            totalSubmitted += submissions.size();
            for (AssignmentSubmission sub : submissions) {
                if ("EVALUATED".equalsIgnoreCase(sub.getStatus())) {
                    totalEvaluated++;
                } else {
                    pendingEvaluation++;
                }
            }
        }

        long totalPossibleSubmissions = totalAssignments * totalStudents;
        long totalPending = Math.max(0, totalPossibleSubmissions - totalSubmitted);

        String batchName = batchId;
        Optional<Batch> batchOpt = batchRepository.findById(batchId);
        if (batchOpt.isPresent()) {
            batchName = batchOpt.get().getBatchName();
        }

        return TrainerAssignmentStatsResponse.builder()
                .batchId(batchId)
                .batchName(batchName)
                .totalAssignments(totalAssignments)
                .totalStudents(totalStudents)
                .totalSubmitted(totalSubmitted)
                .totalPending(totalPending)
                .totalEvaluated(totalEvaluated)
                .pendingEvaluation(pendingEvaluation)
                .build();
    }

    @Override
    public List<AssignmentSubmissionDetailResponse> getAssignmentSubmissions(String assignmentId, String batchId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));

        List<Student> batchStudents = studentRepository.findByBatchId(batchId);
        List<AssignmentSubmission> submissions = assignmentSubmissionRepository.findByAssignmentId(assignmentId);

        Map<String, AssignmentSubmission> studentSubmissionMap = submissions.stream()
                .collect(Collectors.toMap(AssignmentSubmission::getStudentId, s -> s, (s1, s2) -> s1));

        List<AssignmentSubmissionDetailResponse> list = new ArrayList<>();
        LocalDate dueDate = assignment.getDueDate();
        LocalDate now = LocalDate.now();

        for (Student student : batchStudents) {
            AssignmentSubmission sub = studentSubmissionMap.get(student.getId());
            if (sub != null) {
                boolean isEvaluated = "EVALUATED".equalsIgnoreCase(sub.getStatus());
                boolean isLate = sub.getSubmittedAt() != null && dueDate != null && sub.getSubmittedAt().toLocalDate().isAfter(dueDate);

                String statusStr = isEvaluated ? "EVALUATED" : (isLate ? "LATE" : ("DRAFT".equalsIgnoreCase(sub.getSubmissionStatus()) ? "DRAFT" : "SUBMITTED"));
                String evalStatus = isEvaluated ? "EVALUATED" : ("DRAFT".equalsIgnoreCase(sub.getSubmissionStatus()) ? "DRAFT" : "PENDING_EVALUATION");

                list.add(AssignmentSubmissionDetailResponse.builder()
                        .submissionId(sub.getId())
                        .assignmentId(assignmentId)
                        .assignmentTitle(assignment.getTitle())
                        .studentId(student.getId())
                        .studentName(student.getFirstName() + " " + student.getLastName())
                        .studentEmail(student.getEmail())
                        .questionSource(assignment.getQuestionSource() != null ? assignment.getQuestionSource() : "MANUAL")
                        .questions(assignment.getQuestions())
                        .questionAnswers(sub.getQuestionAnswers())
                        .submissionStatus(sub.getSubmissionStatus())
                        .submissionFileUrl(sub.getSubmissionFileUrl())
                        .submissionRemarks(sub.getSubmissionRemarks())
                        .submittedAt(sub.getSubmittedAt())
                        .obtainedMarks(sub.getObtainedMarks())
                        .maxMarks(assignment.getTotalMarks())
                        .trainerRemarks(sub.getTrainerRemarks())
                        .status(statusStr)
                        .evaluationStatus(evalStatus)
                        .dueDate(dueDate)
                        .daysOverdue(0L)
                        .isOverdue(false)
                        .build());
            } else {
                long daysOverdue = 0;
                boolean isOverdue = false;
                if (dueDate != null && now.isAfter(dueDate)) {
                    isOverdue = true;
                    daysOverdue = ChronoUnit.DAYS.between(dueDate, now);
                }

                list.add(AssignmentSubmissionDetailResponse.builder()
                        .submissionId(null)
                        .assignmentId(assignmentId)
                        .assignmentTitle(assignment.getTitle())
                        .studentId(student.getId())
                        .studentName(student.getFirstName() + " " + student.getLastName())
                        .studentEmail(student.getEmail())
                        .questionSource(assignment.getQuestionSource() != null ? assignment.getQuestionSource() : "MANUAL")
                        .questions(assignment.getQuestions())
                        .questionAnswers(null)
                        .submissionStatus(null)
                        .submissionFileUrl(null)
                        .submissionRemarks(null)
                        .submittedAt(null)
                        .obtainedMarks(null)
                        .maxMarks(assignment.getTotalMarks())
                        .trainerRemarks(null)
                        .status(isOverdue ? "OVERDUE" : "PENDING")
                        .evaluationStatus("NOT_SUBMITTED")
                        .dueDate(dueDate)
                        .daysOverdue(daysOverdue)
                        .isOverdue(isOverdue)
                        .build());
            }
        }
        return list;
    }

    @Override
    public AssignmentSubmissionDetailResponse evaluateSubmission(String submissionId, EvaluationRequest request, String trainerEmail) {
        AssignmentSubmission submission = assignmentSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found: " + submissionId));

        if (request.getQuestionAnswers() != null && !request.getQuestionAnswers().isEmpty()) {
            submission.setQuestionAnswers(request.getQuestionAnswers());
            int sumObtained = 0;
            for (com.example.SPT.entity.QuestionAnswer qa : request.getQuestionAnswers()) {
                if (qa.getMarksObtained() != null) {
                    if (qa.getMaxMarks() != null && qa.getMarksObtained() > qa.getMaxMarks()) {
                        throw new IllegalArgumentException("Marks obtained for question cannot exceed maximum marks (" + qa.getMaxMarks() + ").");
                    }
                    sumObtained += qa.getMarksObtained();
                }
            }
            submission.setObtainedMarks(sumObtained);
        } else if (request.getObtainedMarks() != null) {
            submission.setObtainedMarks(request.getObtainedMarks());
        }

        submission.setTrainerRemarks(request.getTrainerRemarks());
        submission.setStatus("EVALUATED");
        submission.setUpdatedAt(LocalDateTime.now());

        if (trainerEmail != null) {
            trainerRepository.findByEmail(trainerEmail).ifPresent(t -> {
                submission.setTrainerId(t.getId());
                submission.setTrainerName(t.getFirstName() + " " + t.getLastName());
            });
        }

        AssignmentSubmission saved = assignmentSubmissionRepository.save(submission);

        Assignment assignment = assignmentRepository.findById(saved.getAssignmentId()).orElse(null);
        Integer maxMarks = assignment != null ? assignment.getTotalMarks() : 100;
        String assignmentTitle = assignment != null ? assignment.getTitle() : saved.getAssignmentTitle();

        Student student = studentRepository.findById(saved.getStudentId()).orElse(null);
        String studentName = student != null ? (student.getFirstName() + " " + student.getLastName()) : saved.getStudentName();
        String studentEmail = student != null ? student.getEmail() : "";

        return AssignmentSubmissionDetailResponse.builder()
                .submissionId(saved.getId())
                .assignmentId(saved.getAssignmentId())
                .assignmentTitle(assignmentTitle)
                .studentId(saved.getStudentId())
                .studentName(studentName)
                .studentEmail(studentEmail)
                .questionSource(assignment != null ? assignment.getQuestionSource() : "MANUAL")
                .questions(assignment != null ? assignment.getQuestions() : null)
                .questionAnswers(saved.getQuestionAnswers())
                .submissionStatus(saved.getSubmissionStatus())
                .submissionFileUrl(saved.getSubmissionFileUrl())
                .submissionRemarks(saved.getSubmissionRemarks())
                .submittedAt(saved.getSubmittedAt())
                .obtainedMarks(saved.getObtainedMarks())
                .maxMarks(maxMarks)
                .trainerRemarks(saved.getTrainerRemarks())
                .status("EVALUATED")
                .evaluationStatus("EVALUATED")
                .build();
    }

    @Override
    public List<Batch> getAllBatches() {
        return batchRepository.findAll();
    }

    @Override
    public TrainerResponse switchTrainerBatch(String trainerEmail, TrainerBatchSwitchRequest request) {
        Trainer trainer = trainerRepository.findByEmail(trainerEmail)
                .orElseGet(() -> {
                    return trainerRepository.findAll().stream()
                            .filter(t -> trainerEmail.equalsIgnoreCase(t.getEmail()))
                            .findFirst()
                            .orElseThrow(() -> new RuntimeException("Trainer not found for email: " + trainerEmail));
                });

        String newBatchId = request.getBatchId();
        String newBatchName = request.getBatchName();

        if (newBatchName == null || newBatchName.isBlank()) {
            Optional<Batch> batchOpt = batchRepository.findById(newBatchId);
            if (batchOpt.isPresent()) {
                newBatchName = batchOpt.get().getBatchName();
            } else {
                newBatchName = newBatchId;
            }
        }

        // Update trainer's assigned batch
        trainer.setBatchId(newBatchId);
        trainer.setBatchName(newBatchName);
        trainer.setUpdatedAt(LocalDateTime.now());
        Trainer updatedTrainer = trainerRepository.save(trainer);

        // Sync with User account if exists
        userRepository.findByEmail(trainerEmail).ifPresent(user -> {
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
        });

        return trainerMapper.toResponse(updatedTrainer);
    }

    @Override
    public AssignmentResponse getAssignmentById(String id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + id));
        AssignmentResponse resp = assignmentMapper.toResponse(assignment);
        enrichAssignmentResponseStats(resp, assignment.getBatchId(), assignment.getDueDate());
        return resp;
    }

    @Override
    public TrainerAssignmentStatsResponse getSingleAssignmentStatistics(String assignmentId, String batchId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + assignmentId));

        String effectiveBatchId = (batchId != null && !batchId.trim().isEmpty()) ? batchId : assignment.getBatchId();
        List<Student> students = studentRepository.findByBatchId(effectiveBatchId);
        long totalStudents = students.size();

        List<AssignmentSubmission> submissions = assignmentSubmissionRepository.findByAssignmentId(assignmentId);
        long totalSubmitted = submissions.size();
        long totalPending = Math.max(0, totalStudents - totalSubmitted);

        long totalEvaluated = 0;
        long pendingEvaluation = 0;

        for (AssignmentSubmission sub : submissions) {
            if ("EVALUATED".equalsIgnoreCase(sub.getStatus())) {
                totalEvaluated++;
            } else {
                pendingEvaluation++;
            }
        }

        String batchName = effectiveBatchId;
        java.util.Optional<Batch> batchOpt = batchRepository.findById(effectiveBatchId);
        if (batchOpt.isPresent()) {
            batchName = batchOpt.get().getBatchName();
        }

        return TrainerAssignmentStatsResponse.builder()
                .batchId(effectiveBatchId)
                .batchName(batchName)
                .totalAssignments(1L)
                .totalStudents(totalStudents)
                .totalSubmitted(totalSubmitted)
                .totalPending(totalPending)
                .totalEvaluated(totalEvaluated)
                .pendingEvaluation(pendingEvaluation)
                .build();
    }

    @Override
    public AssignmentSubmissionDetailResponse getStudentAssignmentSubmission(String assignmentId, String studentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + assignmentId));

        Student student = studentRepository.findById(studentId).orElse(null);
        String studentName = student != null ? (student.getFirstName() + " " + student.getLastName()) : "Student";
        String studentEmail = student != null ? student.getEmail() : "";

        List<AssignmentSubmission> list = assignmentSubmissionRepository.findByAssignmentId(assignmentId);
        AssignmentSubmission submission = list.stream()
                .filter(s -> studentId.equals(s.getStudentId()))
                .findFirst()
                .orElse(null);

        if (submission != null) {
            boolean isEvaluated = "EVALUATED".equalsIgnoreCase(submission.getStatus());
            return AssignmentSubmissionDetailResponse.builder()
                    .submissionId(submission.getId())
                    .assignmentId(assignmentId)
                    .assignmentTitle(assignment.getTitle())
                    .studentId(studentId)
                    .studentName(studentName)
                    .studentEmail(studentEmail)
                    .questionSource(assignment.getQuestionSource() != null ? assignment.getQuestionSource() : "MANUAL")
                    .questions(assignment.getQuestions())
                    .questionAnswers(submission.getQuestionAnswers())
                    .submissionStatus(submission.getSubmissionStatus())
                    .submissionFileUrl(submission.getSubmissionFileUrl())
                    .submissionRemarks(submission.getSubmissionRemarks())
                    .submittedAt(submission.getSubmittedAt())
                    .obtainedMarks(submission.getObtainedMarks())
                    .maxMarks(assignment.getTotalMarks())
                    .trainerRemarks(submission.getTrainerRemarks())
                    .status(isEvaluated ? "EVALUATED" : ("DRAFT".equalsIgnoreCase(submission.getSubmissionStatus()) ? "DRAFT" : "SUBMITTED"))
                    .evaluationStatus(isEvaluated ? "EVALUATED" : "PENDING_EVALUATION")
                    .dueDate(assignment.getDueDate())
                    .build();
        } else {
            return AssignmentSubmissionDetailResponse.builder()
                    .submissionId(null)
                    .assignmentId(assignmentId)
                    .assignmentTitle(assignment.getTitle())
                    .studentId(studentId)
                    .studentName(studentName)
                    .studentEmail(studentEmail)
                    .questionSource(assignment.getQuestionSource() != null ? assignment.getQuestionSource() : "MANUAL")
                    .questions(assignment.getQuestions())
                    .questionAnswers(null)
                    .submissionStatus(null)
                    .submissionFileUrl(null)
                    .submissionRemarks(null)
                    .submittedAt(null)
                    .obtainedMarks(null)
                    .maxMarks(assignment.getTotalMarks())
                    .trainerRemarks(null)
                    .status("NOT_SUBMITTED")
                    .evaluationStatus("NOT_SUBMITTED")
                    .dueDate(assignment.getDueDate())
                    .build();
        }
    }

    private void enrichAssignmentResponseStats(AssignmentResponse resp, String batchId, LocalDate dueDate) {
        if (resp == null || batchId == null) return;
        List<Student> students = studentRepository.findByBatchId(batchId);
        int totalStudents = students.size();
        List<AssignmentSubmission> submissions = assignmentSubmissionRepository.findByAssignmentId(resp.getId());

        int submittedCount = submissions.size();
        int pendingCount = Math.max(0, totalStudents - submittedCount);
        int evaluatedCount = (int) submissions.stream().filter(s -> "EVALUATED".equalsIgnoreCase(s.getStatus())).count();
        int pendingEvaluationCount = Math.max(0, submittedCount - evaluatedCount);

        resp.setTotalStudents(totalStudents);
        resp.setSubmittedCount(submittedCount);
        resp.setPendingCount(pendingCount);
        resp.setEvaluatedCount(evaluatedCount);
        resp.setPendingEvaluationCount(pendingEvaluationCount);

        if (dueDate != null && LocalDate.now().isAfter(dueDate) && pendingCount > 0) {
            resp.setStatus("OVERDUE");
        } else if (evaluatedCount == totalStudents && totalStudents > 0) {
            resp.setStatus("EVALUATED");
        } else if (submittedCount == totalStudents && totalStudents > 0) {
            resp.setStatus("SUBMITTED");
        } else {
            resp.setStatus(resp.getStatus() != null ? resp.getStatus() : "ACTIVE");
        }
    }

    private void validateAssignmentDates(java.time.LocalDate assignedDate, java.time.LocalDate dueDate) {
        java.time.ZoneId zoneId = java.time.ZoneId.of("Asia/Kolkata");
        java.time.LocalDate today = java.time.LocalDate.now(zoneId);

        if (dueDate == null) {
            throw new IllegalArgumentException("Assignment due date is required.");
        }

        if (dueDate.isBefore(today)) {
            throw new IllegalArgumentException("Assignment due date and time cannot be in the past.");
        }

        if (assignedDate != null && dueDate.isBefore(assignedDate)) {
            throw new IllegalArgumentException("Assignment due date must be after the start date.");
        }
    }
}