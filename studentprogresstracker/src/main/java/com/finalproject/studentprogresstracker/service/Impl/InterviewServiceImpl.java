package com.finalproject.studentprogresstracker.service.Impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.finalproject.studentprogresstracker.dto.request.InterviewRequest;
import com.finalproject.studentprogresstracker.dto.response.InterviewResponse;
import com.finalproject.studentprogresstracker.entity.Interview;
import com.finalproject.studentprogresstracker.entity.SelectionStatus;
import com.finalproject.studentprogresstracker.entity.Student;
import com.finalproject.studentprogresstracker.mapper.InterviewMapper;
import com.finalproject.studentprogresstracker.repository.InterviewRepository;
import com.finalproject.studentprogresstracker.repository.StudentRepository;
import com.finalproject.studentprogresstracker.service.InterviewService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InterviewServiceImpl implements InterviewService {

    private static final int TECHNICAL_MAX = 40;
    private static final int PROBLEM_SOLVING_MAX = 20;

    private static final int SOFT_SKILL_MAX = 20;
    private static final int COMMUNICATION_MAX = 20;
    private static final int BEHAVIOUR_MAX = 20;

    private static final double PASSING_PERCENTAGE = 60.0;

    private final InterviewRepository interviewRepository;
    private final InterviewMapper interviewMapper;
    private final StudentRepository studentRepository;


    // =========================================================
    // CONDUCT INTERVIEW
    // =========================================================

    @Override
    public InterviewResponse conductInterview(
            InterviewRequest request) {

        validateRequest(request);

        Student student = studentRepository
                .findById(request.getStudentId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Student not found with id : "
                                        + request.getStudentId()));

        String interviewType = request.getInterviewType()
                .trim()
                .toUpperCase(Locale.ROOT);

        validateSelectionStage(
                student,
                interviewType);

        int totalMarks;
        double percentage;

        // -----------------------------------------------------
        // TECHNICAL INTERVIEW
        // -----------------------------------------------------

        if ("TECHNICAL".equals(interviewType)) {

            validateMarks(
                    request.getTechnicalMarks(),
                    TECHNICAL_MAX,
                    "Technical marks");

            validateMarks(
                    request.getProblemSolvingMarks(),
                    PROBLEM_SOLVING_MAX,
                    "Problem-solving marks");

            totalMarks =
                    safe(request.getTechnicalMarks())
                            + safe(request.getProblemSolvingMarks());

            percentage = calculatePercentage(
                    totalMarks,
                    TECHNICAL_MAX + PROBLEM_SOLVING_MAX);
        }

        // -----------------------------------------------------
        // SOFT SKILL INTERVIEW
        // -----------------------------------------------------

        else if ("SOFT_SKILL".equals(interviewType)) {

            validateMarks(
                    request.getSoftSkillMarks(),
                    SOFT_SKILL_MAX,
                    "Soft-skill marks");

            validateMarks(
                    request.getCommunicationMarks(),
                    COMMUNICATION_MAX,
                    "Communication marks");

            validateMarks(
                    request.getBehaviourMarks(),
                    BEHAVIOUR_MAX,
                    "Behaviour marks");

            totalMarks =
                    safe(request.getSoftSkillMarks())
                            + safe(request.getCommunicationMarks())
                            + safe(request.getBehaviourMarks());

            percentage = calculatePercentage(
                    totalMarks,
                    SOFT_SKILL_MAX
                            + COMMUNICATION_MAX
                            + BEHAVIOUR_MAX);
        }

        else {
            throw new IllegalArgumentException(
                    "Invalid interview type. "
                            + "Allowed values: TECHNICAL, SOFT_SKILL");
        }

        // -----------------------------------------------------
        // AUTOMATIC RESULT
        // -----------------------------------------------------

        String status =
                percentage >= PASSING_PERCENTAGE
                        ? "SELECTED"
                        : "REJECTED";

        LocalDateTime now = LocalDateTime.now();

        // -----------------------------------------------------
        // CREATE INTERVIEW
        // -----------------------------------------------------

        Interview interview = Interview.builder()
                .studentId(student.getId())
                .studentName(buildStudentName(student))

                .trainerId(request.getTrainerId())

                // No request.getTrainerName()
                .trainerName(null)

                .batchId(request.getBatchId())
                .interviewDate(request.getInterviewDate())
                .interviewType(interviewType)

                .technicalMarks(request.getTechnicalMarks())
                .softSkillMarks(request.getSoftSkillMarks())
                .communicationMarks(request.getCommunicationMarks())
                .problemSolvingMarks(request.getProblemSolvingMarks())
                .behaviourMarks(request.getBehaviourMarks())

                .totalMarks(totalMarks)

                .remarks(request.getRemarks())
                .status(status)

                .createdAt(now)
                .updatedAt(now)

                .build();

        Interview savedInterview =
                interviewRepository.save(interview);

        // -----------------------------------------------------
        // UPDATE STUDENT SELECTION STATUS
        // -----------------------------------------------------

        updateStudentSelectionStatus(
                student,
                interviewType,
                status);

        return interviewMapper.toResponse(
                savedInterview);
    }


    // =========================================================
    // UPDATE INTERVIEW
    // =========================================================

    @Override
    public InterviewResponse updateInterview(
            String id,
            InterviewRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Interview request cannot be null");
        }

        Interview interview =
                interviewRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Interview not found with id : "
                                                + id));

        String interviewType =
                interview.getInterviewType();

        if (interviewType == null
                || interviewType.isBlank()) {

            throw new IllegalStateException(
                    "Interview type is missing");
        }

        interviewType = interviewType
                .trim()
                .toUpperCase(Locale.ROOT);


        // -----------------------------------------------------
        // UPDATE BASIC INFORMATION
        // -----------------------------------------------------

        if (request.getTrainerId() != null) {
            interview.setTrainerId(
                    request.getTrainerId());
        }

        if (request.getBatchId() != null) {
            interview.setBatchId(
                    request.getBatchId());
        }

        if (request.getInterviewDate() != null) {
            interview.setInterviewDate(
                    request.getInterviewDate());
        }

        if (request.getRemarks() != null) {
            interview.setRemarks(
                    request.getRemarks());
        }


        int totalMarks;
        double percentage;


        // -----------------------------------------------------
        // UPDATE TECHNICAL INTERVIEW
        // -----------------------------------------------------

        if ("TECHNICAL".equals(interviewType)) {

            if (request.getTechnicalMarks() != null) {

                validateMarks(
                        request.getTechnicalMarks(),
                        TECHNICAL_MAX,
                        "Technical marks");

                interview.setTechnicalMarks(
                        request.getTechnicalMarks());
            }

            if (request.getProblemSolvingMarks() != null) {

                validateMarks(
                        request.getProblemSolvingMarks(),
                        PROBLEM_SOLVING_MAX,
                        "Problem-solving marks");

                interview.setProblemSolvingMarks(
                        request.getProblemSolvingMarks());
            }

            totalMarks =
                    safe(interview.getTechnicalMarks())
                            + safe(
                                    interview.getProblemSolvingMarks());

            percentage = calculatePercentage(
                    totalMarks,
                    TECHNICAL_MAX + PROBLEM_SOLVING_MAX);
        }


        // -----------------------------------------------------
        // UPDATE SOFT SKILL INTERVIEW
        // -----------------------------------------------------

        else if ("SOFT_SKILL".equals(interviewType)) {

            if (request.getSoftSkillMarks() != null) {

                validateMarks(
                        request.getSoftSkillMarks(),
                        SOFT_SKILL_MAX,
                        "Soft-skill marks");

                interview.setSoftSkillMarks(
                        request.getSoftSkillMarks());
            }

            if (request.getCommunicationMarks() != null) {

                validateMarks(
                        request.getCommunicationMarks(),
                        COMMUNICATION_MAX,
                        "Communication marks");

                interview.setCommunicationMarks(
                        request.getCommunicationMarks());
            }

            if (request.getBehaviourMarks() != null) {

                validateMarks(
                        request.getBehaviourMarks(),
                        BEHAVIOUR_MAX,
                        "Behaviour marks");

                interview.setBehaviourMarks(
                        request.getBehaviourMarks());
            }

            totalMarks =
                    safe(interview.getSoftSkillMarks())
                            + safe(
                                    interview.getCommunicationMarks())
                            + safe(
                                    interview.getBehaviourMarks());

            percentage = calculatePercentage(
                    totalMarks,
                    SOFT_SKILL_MAX
                            + COMMUNICATION_MAX
                            + BEHAVIOUR_MAX);
        }

        else {
            throw new IllegalStateException(
                    "Invalid stored interview type: "
                            + interviewType);
        }


        // -----------------------------------------------------
        // RECALCULATE RESULT
        // -----------------------------------------------------

        String status =
                percentage >= PASSING_PERCENTAGE
                        ? "SELECTED"
                        : "REJECTED";

        interview.setTotalMarks(totalMarks);
        interview.setStatus(status);
        interview.setUpdatedAt(LocalDateTime.now());

        Interview updatedInterview =
                interviewRepository.save(interview);


        // -----------------------------------------------------
        // UPDATE STUDENT STATUS
        // -----------------------------------------------------

        Student student =
                studentRepository.findById(
                        interview.getStudentId())
                        .orElse(null);

        if (student != null) {

            updateStudentSelectionStatus(
                    student,
                    interviewType,
                    status);
        }

        return interviewMapper.toResponse(
                updatedInterview);
    }


    // =========================================================
    // GET INTERVIEW BY STUDENT
    // =========================================================
    @Override
    public InterviewResponse getInterviewByStudent(String studentId) {

        if (studentId == null || studentId.isBlank()) {
            throw new IllegalArgumentException(
                    "Student ID is required");
        }

        List<Interview> interviews =
                interviewRepository.findByStudentId(studentId);

        if (interviews == null || interviews.isEmpty()) {
            throw new RuntimeException(
                    "Interview not found for student id : "
                            + studentId);
        }

        Interview latestInterview =
                interviews.stream()
                        .max(
                            java.util.Comparator.comparing(
                                    Interview::getUpdatedAt,
                                    java.util.Comparator.nullsLast(
                                            java.util.Comparator.naturalOrder())))
                        .orElse(interviews.get(0));

        return interviewMapper.toResponse(
                latestInterview);
    }
   
    // =========================================================
    // VALIDATE REQUEST
    // =========================================================

    private void validateRequest(
            InterviewRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Interview request cannot be null");
        }

        if (request.getStudentId() == null
                || request.getStudentId().isBlank()) {

            throw new IllegalArgumentException(
                    "Student ID is required");
        }

        if (request.getTrainerId() == null
                || request.getTrainerId().isBlank()) {

            throw new IllegalArgumentException(
                    "Trainer ID is required");
        }

        if (request.getInterviewType() == null
                || request.getInterviewType().isBlank()) {

            throw new IllegalArgumentException(
                    "Interview type is required");
        }

        if (request.getInterviewDate() == null) {

            throw new IllegalArgumentException(
                    "Interview date is required");
        }
    }


    // =========================================================
    // VALIDATE SELECTION STAGE
    // =========================================================

    private void validateSelectionStage(
            Student student,
            String interviewType) {

        SelectionStatus currentStatus =
                student.getSelectionStatus();

        if ("TECHNICAL".equals(interviewType)) {

            if (currentStatus
                    != SelectionStatus.TECHNICAL_PENDING) {

                throw new IllegalStateException(
                        "Student is not eligible for "
                                + "technical interview. Current status: "
                                + currentStatus);
            }
        }

        else if ("SOFT_SKILL".equals(interviewType)) {

            if (currentStatus
                    != SelectionStatus.SOFT_SKILL_PENDING) {

                throw new IllegalStateException(
                        "Student is not eligible for "
                                + "soft-skill interview. Current status: "
                                + currentStatus);
            }
        }

        else {
            throw new IllegalArgumentException(
                    "Invalid interview type: "
                            + interviewType);
        }
    }


    // =========================================================
    // UPDATE STUDENT SELECTION STATUS
    // =========================================================

    private void updateStudentSelectionStatus(
            Student student,
            String interviewType,
            String status) {

        // Interview failed
        if ("REJECTED".equals(status)) {

            student.setSelectionStatus(
                    SelectionStatus.REJECTED);
        }

        // Technical interview passed
        else if ("TECHNICAL".equals(interviewType)) {

            student.setSelectionStatus(
                    SelectionStatus.SOFT_SKILL_PENDING);
        }

        // Soft skill interview passed
        else if ("SOFT_SKILL".equals(interviewType)) {

            student.setSelectionStatus(
                    SelectionStatus.DOCUMENT_VERIFICATION_PENDING);
        }

        student.setUpdatedAt(
                LocalDateTime.now());

        studentRepository.save(student);
    }


    // =========================================================
    // VALIDATE MARKS
    // =========================================================

    private void validateMarks(
            Integer marks,
            int maximum,
            String fieldName) {

        if (marks == null) {

            throw new IllegalArgumentException(
                    fieldName + " are required");
        }

        if (marks < 0
                || marks > maximum) {

            throw new IllegalArgumentException(
                    fieldName
                            + " must be between 0 and "
                            + maximum);
        }
    }


    // =========================================================
    // SAFE INTEGER
    // =========================================================

    private int safe(Integer value) {

        return value == null
                ? 0
                : value;
    }


    // =========================================================
    // CALCULATE PERCENTAGE
    // =========================================================

    private double calculatePercentage(
            int obtainedMarks,
            int maximumMarks) {

        if (maximumMarks <= 0) {
            return 0.0;
        }

        double percentage =
                ((double) obtainedMarks
                        / maximumMarks)
                        * 100.0;

        return Math.round(
                percentage * 100.0)
                / 100.0;
    }


    // =========================================================
    // BUILD STUDENT NAME
    // =========================================================

    private String buildStudentName(
            Student student) {

        String firstName =
                student.getFirstName() == null
                        ? ""
                        : student.getFirstName().trim();

        String lastName =
                student.getLastName() == null
                        ? ""
                        : student.getLastName().trim();

        String fullName =
                (firstName + " " + lastName).trim();

        return fullName.isBlank()
                ? null
                : fullName;
    }
}