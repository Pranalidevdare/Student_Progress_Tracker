package com.example.SPT.service.Impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
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
import com.example.SPT.dto.response.StudentAssignmentResponse;
import com.example.SPT.dto.response.TrainerAssignmentStatsResponse;
import com.example.SPT.dto.response.TrainerResponse;
import com.example.SPT.entity.Assignment;
import com.example.SPT.entity.AssignmentSubmission;
import com.example.SPT.entity.Batch;
import com.example.SPT.entity.Student;
import com.example.SPT.entity.Trainer;
import com.example.SPT.exception.ResourceNotFoundException;
import com.example.SPT.mapper.AssignmentMapper;
import com.example.SPT.mapper.TrainerMapper;
import com.example.SPT.repository.AssignmentRepository;
import com.example.SPT.repository.AssignmentSubmissionRepository;
import com.example.SPT.repository.BatchRepository;
import com.example.SPT.repository.StudentRepository;
import com.example.SPT.repository.TrainerRepository;
import com.example.SPT.repository.UserRepository;
import com.example.SPT.service.AssignmentService;
import com.example.SPT.service.NotificationService;

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
    private final NotificationService notificationService;

    @Override
    public AssignmentResponse createAssignment(AssignmentRequest request) {
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

        Assignment assignment = assignmentMapper.toEntity(request);
        assignment.setQuestionSource(qSource);
        assignment.setStatus("ACTIVE");
        assignment.setCreatedAt(LocalDateTime.now());
        assignment.setUpdatedAt(LocalDateTime.now());

        if (assignment.getSubmissionType() == null) {
            assignment.setSubmissionType("FILE");
        }

        Assignment savedAssignment = assignmentRepository.save(assignment);
        AssignmentResponse response = assignmentMapper.toResponse(savedAssignment);

        enrichAssignmentResponseStats(response, savedAssignment.getBatchId(), savedAssignment.getDueDate());

        try {
            notificationService.createBatchNotifications(
                savedAssignment.getBatchId(),
                "New Assignment Posted",
                "Assignment '" + savedAssignment.getTitle() + "' has been assigned. Due: " + savedAssignment.getDueDate(),
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
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id : " + id));

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
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id : " + id));

        assignmentRepository.delete(assignment);
    }

    @Override
    public List<AssignmentResponse> getAssignmentsByBatch(String batchId) {
        System.out.println("Fetching assignments for batchId = '" + batchId + "'");
        List<Assignment> assignments = fetchAssignmentsForBatch(batchId);
        System.out.println("Assignments found: " + assignments.size());

        return assignments.stream()
                .map(assignment -> {
                    AssignmentResponse resp = assignmentMapper.toResponse(assignment);
                    enrichAssignmentResponseStats(resp, batchId, assignment.getDueDate());
                    return resp;
                })
                .collect(Collectors.toList());
    }

    private List<Assignment> fetchAssignmentsForBatch(String batchId) {
        List<Assignment> assignments = assignmentRepository.findByBatchId(batchId);

        if (assignments.isEmpty()) {
            List<Assignment> all = assignmentRepository.findAll();
            for (Assignment a : all) {
                if (a.getBatchId() == null || a.getBatchId().equalsIgnoreCase(batchId)
                        || "BATCH001".equalsIgnoreCase(batchId)
                        || "6a7ace0ff6f2350ae9ad7b53".equalsIgnoreCase(batchId)
                        || "6a7ace0ff6f2350ae9ad7b53".equals(a.getBatchId())) {
                    if ("BATCH001".equalsIgnoreCase(batchId) && !"BATCH001".equals(a.getBatchId())) {
                        a.setBatchId("BATCH001");
                        assignmentRepository.save(a);
                    }
                    assignments.add(a);
                }
            }
        }
        return assignments;
    }

    @Override
    public List<StudentAssignmentResponse> getStudentAssignments(String studentId, String batchId) {
        Student student = null;
        if (studentRepository != null && studentId != null && !studentId.isBlank()) {
            student = studentRepository.findById(studentId)
                    .or(() -> studentRepository.findByStudentId(studentId))
                    .or(() -> studentRepository.findByEmail(studentId))
                    .orElse(null);
        }

        String effectiveBatchId = (batchId != null && !batchId.isBlank())
                ? batchId
                : (student != null ? student.getBatchId() : "BATCH001");

        List<Assignment> assignments = fetchAssignmentsForBatch(effectiveBatchId);

        String targetStudentId = student != null ? student.getId() : studentId;
        String altStudentId = student != null ? student.getStudentId() : studentId;

        List<AssignmentSubmission> submissions = new ArrayList<>();
        if (targetStudentId != null) {
            submissions.addAll(assignmentSubmissionRepository.findByStudentId(targetStudentId));
        }
        if (altStudentId != null && !altStudentId.equals(targetStudentId)) {
            submissions.addAll(assignmentSubmissionRepository.findByStudentId(altStudentId));
        }

        Map<String, AssignmentSubmission> submissionMap = new HashMap<>();
        for (AssignmentSubmission sub : submissions) {
            if (sub.getAssignmentId() != null) {
                submissionMap.put(sub.getAssignmentId(), sub);
            }
        }

        List<StudentAssignmentResponse> responses = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (Assignment ass : assignments) {
            AssignmentSubmission sub = submissionMap.get(ass.getId());
            String computedStatus = "PENDING";
            String subId = null;
            String subFileUrl = null;
            String subRemarks = null;
            LocalDateTime subAt = null;
            Integer obtainedMarks = null;
            String trainerRemarks = null;

            if (sub != null) {
                subId = sub.getId();
                subFileUrl = sub.getSubmissionFileUrl();
                subRemarks = sub.getSubmissionRemarks();
                subAt = sub.getSubmittedAt();
                obtainedMarks = sub.getObtainedMarks();
                trainerRemarks = sub.getTrainerRemarks();

                if (obtainedMarks != null || (sub.getStatus() != null && "EVALUATED".equalsIgnoreCase(sub.getStatus()))) {
                    computedStatus = "EVALUATED";
                } else {
                    computedStatus = "SUBMITTED";
                }
            } else {
                if (ass.getDueDate() != null && today.isAfter(ass.getDueDate())) {
                    computedStatus = "OVERDUE";
                } else {
                    computedStatus = "PENDING";
                }
            }

            responses.add(StudentAssignmentResponse.builder()
                    .id(ass.getId())
                    .trainerId(ass.getTrainerId())
                    .trainerName(ass.getTrainerName())
                    .batchId(ass.getBatchId())
                    .title(ass.getTitle())
                    .description(ass.getDescription())
                    .subject(ass.getSubject())
                    .totalMarks(ass.getTotalMarks())
                    .assignedDate(ass.getAssignedDate())
                    .dueDate(ass.getDueDate())
                    .attachmentUrl(ass.getAttachmentUrl())
                    .submissionType(ass.getSubmissionType() != null ? ass.getSubmissionType() : "FILE")
                    .submissionId(subId)
                    .submissionFileUrl(subFileUrl)
                    .submissionRemarks(subRemarks)
                    .submittedAt(subAt)
                    .obtainedMarks(obtainedMarks)
                    .trainerRemarks(trainerRemarks)
                    .status(computedStatus)
                    .build());
        }

        return responses;
    }

    @Override
    public void submitAssignment(AssignmentSubmissionRequest request) {
        if (request == null || request.getAssignmentId() == null || request.getAssignmentId().isBlank()) {
            throw new IllegalArgumentException("Assignment ID is required");
        }

        Assignment assignment = assignmentRepository.findById(request.getAssignmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + request.getAssignmentId()));

        Student student = null;
        if (studentRepository != null && request.getStudentId() != null) {
            student = studentRepository.findById(request.getStudentId())
                    .or(() -> studentRepository.findByStudentId(request.getStudentId()))
                    .or(() -> studentRepository.findByEmail(request.getStudentId()))
                    .orElse(null);
        }

        String studentMongoId = student != null ? student.getId() : request.getStudentId();
        String studentName = student != null ? (student.getFirstName() + " " + student.getLastName()).trim() : "Student";

        AssignmentSubmission existing = assignmentSubmissionRepository.findByAssignmentIdAndStudentId(assignment.getId(), studentMongoId)
                .orElse(null);

        if (existing == null && student != null && student.getStudentId() != null) {
            existing = assignmentSubmissionRepository.findByAssignmentIdAndStudentId(assignment.getId(), student.getStudentId())
                    .orElse(null);
        }

        boolean isDraft = "DRAFT".equalsIgnoreCase(request.getSubmissionStatus());

        if (existing != null) {
            existing.setSubmissionFileUrl(request.getSubmissionFileUrl());
            existing.setSubmissionRemarks(request.getSubmissionRemarks());
            if (request.getQuestionAnswers() != null) {
                existing.setQuestionAnswers(request.getQuestionAnswers());
            }
            existing.setSubmissionStatus(isDraft ? "DRAFT" : "SUBMITTED");
            if (isDraft) {
                existing.setStatus("DRAFT");
            } else {
                existing.setSubmittedAt(LocalDateTime.now());
                existing.setStatus("PENDING");
            }
            existing.setUpdatedAt(LocalDateTime.now());
            assignmentSubmissionRepository.save(existing);
        } else {
            AssignmentSubmission submission = AssignmentSubmission.builder()
                    .assignmentId(assignment.getId())
                    .assignmentTitle(assignment.getTitle())
                    .studentId(studentMongoId)
                    .studentName(studentName)
                    .trainerId(assignment.getTrainerId())
                    .trainerName(assignment.getTrainerName())
                    .batchId(assignment.getBatchId())
                    .submissionFileUrl(request.getSubmissionFileUrl())
                    .submissionRemarks(request.getSubmissionRemarks())
                    .questionAnswers(request.getQuestionAnswers())
                    .submissionStatus(isDraft ? "DRAFT" : "SUBMITTED")
                    .submittedAt(isDraft ? null : LocalDateTime.now())
                    .status(isDraft ? "DRAFT" : "PENDING")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            assignmentSubmissionRepository.save(submission);
        }
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
        Optional<Batch> bOpt = batchRepository.findById(batchId);
        if (bOpt.isPresent() && bOpt.get().getBatchName() != null) {
            batchName = bOpt.get().getBatchName();
        }

        return TrainerAssignmentStatsResponse.builder()
                .batchId(batchId)
                .batchName(batchName)
                .totalAssignments(totalAssignments)
                .totalStudents(totalStudents)
                .totalSubmitted(totalSubmitted)
                .totalEvaluated(totalEvaluated)
                .pendingEvaluation(pendingEvaluation)
                .totalPending(totalPending)
                .build();
    }

    @Override
    public List<AssignmentSubmissionDetailResponse> getAssignmentSubmissions(String assignmentId, String batchId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + assignmentId));

        String effectiveBatchId = (batchId != null && !batchId.isBlank()) ? batchId : assignment.getBatchId();

        List<Student> students = studentRepository.findByBatchId(effectiveBatchId);
        List<AssignmentSubmission> submissions = assignmentSubmissionRepository.findByAssignmentId(assignmentId);

        Map<String, AssignmentSubmission> submissionByStudentId = new HashMap<>();
        for (AssignmentSubmission sub : submissions) {
            submissionByStudentId.put(sub.getStudentId(), sub);
        }

        List<AssignmentSubmissionDetailResponse> result = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (Student s : students) {
            AssignmentSubmission sub = submissionByStudentId.get(s.getId());
            if (sub == null && s.getStudentId() != null) {
                sub = submissionByStudentId.get(s.getStudentId());
            }

            String computedStatus;
            String subId = null;
            String subFileUrl = null;
            String subRemarks = null;
            LocalDateTime subAt = null;
            Integer obtainedMarks = null;
            String trainerRemarks = null;
            Double pct = null;
            String grade = null;

            if (sub != null) {
                subId = sub.getId();
                subFileUrl = sub.getSubmissionFileUrl();
                subRemarks = sub.getSubmissionRemarks();
                subAt = sub.getSubmittedAt();
                obtainedMarks = sub.getObtainedMarks();
                trainerRemarks = sub.getTrainerRemarks();

                if ("EVALUATED".equalsIgnoreCase(sub.getStatus()) || obtainedMarks != null) {
                    computedStatus = "EVALUATED";
                    if (obtainedMarks != null && assignment.getTotalMarks() != null && assignment.getTotalMarks() > 0) {
                        pct = (obtainedMarks.doubleValue() / assignment.getTotalMarks().doubleValue()) * 100.0;
                        grade = calculateGrade(pct);
                    }
                } else {
                    computedStatus = "SUBMITTED";
                }
            } else {
                if (assignment.getDueDate() != null && today.isAfter(assignment.getDueDate())) {
                    computedStatus = "OVERDUE";
                } else {
                    computedStatus = "PENDING";
                }
            }

            result.add(AssignmentSubmissionDetailResponse.builder()
                    .submissionId(subId)
                    .assignmentId(assignment.getId())
                    .assignmentTitle(assignment.getTitle())
                    .maxMarks(assignment.getTotalMarks())
                    .studentId(s.getId())
                    .studentName(s.getFirstName() + " " + s.getLastName())
                    .studentEmail(s.getEmail())
                    .submissionFileUrl(subFileUrl)
                    .submissionRemarks(subRemarks)
                    .submittedAt(subAt)
                    .obtainedMarks(obtainedMarks)
                    .trainerRemarks(trainerRemarks)
                    .status(computedStatus)
                    .dueDate(assignment.getDueDate())
                    .build());
        }

        return result;
    }

    @Override
    public AssignmentSubmissionDetailResponse evaluateSubmission(String submissionId, EvaluationRequest request, String trainerEmail) {
        AssignmentSubmission submission = assignmentSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + submissionId));

        Assignment assignment = assignmentRepository.findById(submission.getAssignmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + submission.getAssignmentId()));

        if (request.getObtainedMarks() != null && assignment.getTotalMarks() != null) {
            if (request.getObtainedMarks() > assignment.getTotalMarks()) {
                throw new IllegalArgumentException("Obtained marks cannot exceed total marks (" + assignment.getTotalMarks() + ").");
            }
            if (request.getObtainedMarks() < 0) {
                throw new IllegalArgumentException("Obtained marks cannot be negative.");
            }
        }

        submission.setObtainedMarks(request.getObtainedMarks());
        submission.setTrainerRemarks(request.getTrainerRemarks());
        submission.setStatus("EVALUATED");
        submission.setUpdatedAt(LocalDateTime.now());

        AssignmentSubmission saved = assignmentSubmissionRepository.save(submission);

        Student student = studentRepository.findById(saved.getStudentId()).orElse(null);

        return AssignmentSubmissionDetailResponse.builder()
                .submissionId(saved.getId())
                .assignmentId(assignment.getId())
                .assignmentTitle(assignment.getTitle())
                .maxMarks(assignment.getTotalMarks())
                .studentId(saved.getStudentId())
                .studentName(saved.getStudentName() != null ? saved.getStudentName() : (student != null ? student.getFirstName() + " " + student.getLastName() : "Student"))
                .studentEmail(student != null ? student.getEmail() : null)
                .submissionFileUrl(saved.getSubmissionFileUrl())
                .submissionRemarks(saved.getSubmissionRemarks())
                .submittedAt(saved.getSubmittedAt())
                .obtainedMarks(saved.getObtainedMarks())
                .trainerRemarks(saved.getTrainerRemarks())
                .status("EVALUATED")
                .dueDate(assignment.getDueDate())
                .build();
    }

    @Override
    public List<Batch> getAllBatches() {
        return batchRepository.findAll();
    }

    @Override
    public TrainerResponse switchTrainerBatch(String trainerEmail, TrainerBatchSwitchRequest request) {
        Trainer trainer = trainerRepository.findByEmail(trainerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer not found with email: " + trainerEmail));

        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Target batch not found with id: " + request.getBatchId()));

        trainer.setBatchId(batch.getId());
        trainer.setBatchName(batch.getBatchName());
        trainer.setUpdatedAt(LocalDateTime.now());

        Trainer updatedTrainer = trainerRepository.save(trainer);
        return trainerMapper.toResponse(updatedTrainer);
    }

    @Override
    public AssignmentResponse getAssignmentById(String id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));
        AssignmentResponse response = assignmentMapper.toResponse(assignment);
        enrichAssignmentResponseStats(response, assignment.getBatchId(), assignment.getDueDate());
        return response;
    }

    @Override
    public TrainerAssignmentStatsResponse getSingleAssignmentStatistics(String assignmentId, String batchId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + assignmentId));

        String effectiveBatchId = (batchId != null && !batchId.isBlank()) ? batchId : assignment.getBatchId();
        List<Student> students = studentRepository.findByBatchId(effectiveBatchId);
        long totalStudents = students.size();

        List<AssignmentSubmission> submissions = assignmentSubmissionRepository.findByAssignmentId(assignmentId);
        long totalSubmitted = submissions.size();
        long totalEvaluated = submissions.stream().filter(s -> "EVALUATED".equalsIgnoreCase(s.getStatus()) || s.getObtainedMarks() != null).count();
        long pendingEvaluation = totalSubmitted - totalEvaluated;
        long pendingSubmission = Math.max(0, totalStudents - totalSubmitted);

        String batchName = effectiveBatchId;
        Optional<Batch> bOpt = batchRepository.findById(effectiveBatchId);
        if (bOpt.isPresent() && bOpt.get().getBatchName() != null) {
            batchName = bOpt.get().getBatchName();
        }

        return TrainerAssignmentStatsResponse.builder()
                .batchId(effectiveBatchId)
                .batchName(batchName)
                .totalAssignments(1L)
                .totalStudents(totalStudents)
                .totalSubmitted(totalSubmitted)
                .totalEvaluated(totalEvaluated)
                .pendingEvaluation(pendingEvaluation)
                .totalPending(pendingSubmission)
                .build();
    }

    @Override
    public AssignmentSubmissionDetailResponse getStudentAssignmentSubmission(String assignmentId, String studentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + assignmentId));

        AssignmentSubmission sub = assignmentSubmissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId)
                .orElse(null);

        if (sub == null) {
            Student student = studentRepository.findByStudentId(studentId).orElse(null);
            if (student != null) {
                sub = assignmentSubmissionRepository.findByAssignmentIdAndStudentId(assignmentId, student.getId()).orElse(null);
            }
        }

        Student student = studentRepository.findById(studentId)
                .or(() -> studentRepository.findByStudentId(studentId))
                .orElse(null);

        String computedStatus = "PENDING";
        String subId = null;
        String subFileUrl = null;
        String subRemarks = null;
        LocalDateTime subAt = null;
        Integer obtainedMarks = null;
        String trainerRemarks = null;

        if (sub != null) {
            subId = sub.getId();
            subFileUrl = sub.getSubmissionFileUrl();
            subRemarks = sub.getSubmissionRemarks();
            subAt = sub.getSubmittedAt();
            obtainedMarks = sub.getObtainedMarks();
            trainerRemarks = sub.getTrainerRemarks();

            if ("EVALUATED".equalsIgnoreCase(sub.getStatus()) || obtainedMarks != null) {
                computedStatus = "EVALUATED";
            } else {
                computedStatus = "SUBMITTED";
            }
        } else {
            if (assignment.getDueDate() != null && LocalDate.now().isAfter(assignment.getDueDate())) {
                computedStatus = "OVERDUE";
            }
        }

        return AssignmentSubmissionDetailResponse.builder()
                .submissionId(subId)
                .assignmentId(assignment.getId())
                .assignmentTitle(assignment.getTitle())
                .maxMarks(assignment.getTotalMarks())
                .studentId(student != null ? student.getId() : studentId)
                .studentName(sub != null && sub.getStudentName() != null ? sub.getStudentName() : (student != null ? student.getFirstName() + " " + student.getLastName() : "Student"))
                .studentEmail(student != null ? student.getEmail() : null)
                .submissionFileUrl(subFileUrl)
                .submissionRemarks(subRemarks)
                .submittedAt(subAt)
                .obtainedMarks(obtainedMarks)
                .trainerRemarks(trainerRemarks)
                .status(computedStatus)
                .dueDate(assignment.getDueDate())
                .build();
    }

    private void validateAssignmentDates(LocalDate assignedDate, LocalDate dueDate) {
        if (assignedDate != null && dueDate != null && dueDate.isBefore(assignedDate)) {
            throw new IllegalArgumentException("Due date cannot be earlier than assigned date.");
        }
    }

    private String calculateGrade(double percentage) {
        if (percentage >= 90) return "A+";
        if (percentage >= 80) return "A";
        if (percentage >= 70) return "B";
        if (percentage >= 60) return "C";
        if (percentage >= 50) return "D";
        return "F";
    }

    private void enrichAssignmentResponseStats(AssignmentResponse response, String batchId, LocalDate dueDate) {
        if (response == null || batchId == null) return;
        List<AssignmentSubmission> submissions = assignmentSubmissionRepository.findByAssignmentId(response.getId());
        int submitted = submissions.size();
        int evaluated = (int) submissions.stream().filter(s -> "EVALUATED".equalsIgnoreCase(s.getStatus()) || s.getObtainedMarks() != null).count();
        int pendingEval = submitted - evaluated;

        response.setSubmittedCount(submitted);
        response.setEvaluatedCount(evaluated);
        response.setPendingEvaluationCount(pendingEval);

        if (dueDate != null) {
            long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), dueDate);
            response.setDaysRemaining((int) daysLeft);
        }
    }
}