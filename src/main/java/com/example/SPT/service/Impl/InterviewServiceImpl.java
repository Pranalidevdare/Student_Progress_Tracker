package com.example.SPT.service.Impl;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.SPT.dto.request.InterviewRequest;
import com.example.SPT.dto.response.ApplicationResponse;
import com.example.SPT.dto.response.InterviewResponse;
import com.example.SPT.entity.Application;
import com.example.SPT.entity.Interview;
import com.example.SPT.entity.SelectionStatus;
import com.example.SPT.entity.Student;
import com.example.SPT.entity.User;
import com.example.SPT.enums.ApplicationStatus;
import com.example.SPT.enums.Role;
import com.example.SPT.enums.TrainerType;
import com.example.SPT.mapper.InterviewMapper;
import com.example.SPT.repository.ApplicationRepository;
import com.example.SPT.repository.InterviewRepository;
import com.example.SPT.repository.StudentRepository;
import com.example.SPT.repository.UserRepository;
import com.example.SPT.service.InterviewService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
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
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;


    // =========================================================
    // CONDUCT INTERVIEW
    // =========================================================

    @Override
    public InterviewResponse conductInterview(
            InterviewRequest request) {

        validateRequest(request);

        Optional<Application> appOpt = applicationRepository.findByApplicationNumber(request.getStudentId());
        if (appOpt.isEmpty()) {
            appOpt = applicationRepository.findById(request.getStudentId());
        }
        if (appOpt.isEmpty()) {
            appOpt = applicationRepository.findByEmail(request.getStudentId());
        }

        Student student = studentRepository
                .findById(request.getStudentId())
                .or(() -> studentRepository.findByEmail(request.getStudentId()))
                .orElse(null);

        if (student == null) {
            if (appOpt.isPresent()) {
                Application app = appOpt.get();
                student = studentRepository.findByEmail(app.getEmail()).orElse(null);
                if (student == null) {
                    student = Student.builder()
                            .id(app.getId())
                            .firstName(app.getFullName() != null ? app.getFullName().split(" ")[0] : "Candidate")
                            .lastName(app.getFullName() != null && app.getFullName().contains(" ") ? app.getFullName().substring(app.getFullName().indexOf(" ") + 1) : "")
                            .email(app.getEmail())
                            .mobile(app.getMobile())
                            .batchId(request.getBatchId())
                            .selectionStatus(SelectionStatus.TECHNICAL_PENDING)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    student = studentRepository.save(student);
                }
            } else {
                throw new RuntimeException("Student not found with id : " + request.getStudentId());
            }
        }

        String interviewType = request.getInterviewType()
                .trim()
                .toUpperCase(Locale.ROOT);

        // -----------------------------------------------------
        // TRAINER ROLE-BASED AUTHORIZATION CHECK
        // -----------------------------------------------------
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String tempCaller = null;
        if (auth != null && auth.isAuthenticated() && !auth.getName().equalsIgnoreCase("anonymousUser")) {
            tempCaller = auth.getName();
        }
        if (tempCaller == null || tempCaller.isBlank()) {
            tempCaller = request.getTrainerId();
        }
        final String trainerIdentifier = tempCaller;

        if (trainerIdentifier != null && !trainerIdentifier.isBlank()) {
            Optional<User> trainerUserOpt = userRepository.findByEmail(trainerIdentifier)
                    .or(() -> userRepository.findById(trainerIdentifier));
            if (trainerUserOpt.isPresent()) {
                User trainerUser = trainerUserOpt.get();
                if (trainerUser.getRole() == Role.TRAINER) {
                    TrainerType tType = trainerUser.getTrainerType();
                    if (tType == TrainerType.TECHNICAL && !"TECHNICAL".equals(interviewType)) {
                        throw new IllegalStateException("Technical Trainers are only authorized to evaluate Technical Interviews.");
                    } else if (tType == TrainerType.SOFT_SKILLS && !"SOFT_SKILL".equals(interviewType)) {
                        throw new IllegalStateException("Soft-Skill / HR Trainers are only authorized to evaluate Soft-Skill / HR Interviews.");
                    }
                }
            }
        }

        validateSelectionStage(
                student,
                appOpt.orElse(null),
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
        // UPDATE STUDENT & APPLICATION SELECTION STATUS
        // -----------------------------------------------------

        updateStudentSelectionStatus(
                student,
                interviewType,
                status,
                interview.getRemarks(),
                appOpt);

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
        // UPDATE STUDENT & APPLICATION STATUS
        // -----------------------------------------------------

        Student student =
                studentRepository.findById(
                        interview.getStudentId())
                        .orElse(null);

        Optional<Application> appOpt = applicationRepository.findById(interview.getStudentId())
                .or(() -> applicationRepository.findByApplicationNumber(interview.getStudentId()))
                .or(() -> student != null ? applicationRepository.findByEmail(student.getEmail()) : Optional.empty());

        updateStudentSelectionStatus(
                student,
                interviewType,
                status,
                interview.getRemarks(),
                appOpt);

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
            Application application,
            String interviewType) {

        if ("TECHNICAL".equals(interviewType)) {
            if (application != null) {
                ApplicationStatus appStatus = application.getStatus();
                if (appStatus == ApplicationStatus.TECHNICAL_INTERVIEW_PASSED
                        || appStatus == ApplicationStatus.TECHNICAL_INTERVIEW_FAILED
                        || appStatus == ApplicationStatus.HR_INTERVIEW_PASSED
                        || appStatus == ApplicationStatus.HR_INTERVIEW_FAILED
                        || appStatus == ApplicationStatus.HOME_VISIT_PENDING
                        || appStatus == ApplicationStatus.HOME_VISIT_COMPLETED
                        || appStatus == ApplicationStatus.HOME_VISIT_PASSED
                        || appStatus == ApplicationStatus.SELECTED
                        || appStatus == ApplicationStatus.BATCH_ASSIGNED) {
                    throw new IllegalStateException("Technical interview has already been evaluated for this candidate.");
                }
                if (appStatus != ApplicationStatus.DOCUMENTS_VERIFIED
                        && appStatus != ApplicationStatus.TECHNICAL_INTERVIEW_SCHEDULED) {
                    throw new IllegalStateException(
                            "Candidate is not eligible for technical interview. Current status: " + appStatus + ". Documents must be verified first.");
                }
            } else if (student != null) {
                SelectionStatus currentStatus = student.getSelectionStatus();
                if (currentStatus != SelectionStatus.TECHNICAL_PENDING) {
                    throw new IllegalStateException(
                            "Student is not eligible for technical interview. Current status: " + currentStatus);
                }
            }
        } else if ("SOFT_SKILL".equals(interviewType)) {
            if (application != null) {
                ApplicationStatus appStatus = application.getStatus();
                if (appStatus == ApplicationStatus.HR_INTERVIEW_PASSED
                        || appStatus == ApplicationStatus.HR_INTERVIEW_FAILED
                        || appStatus == ApplicationStatus.HOME_VISIT_PENDING
                        || appStatus == ApplicationStatus.HOME_VISIT_COMPLETED
                        || appStatus == ApplicationStatus.HOME_VISIT_PASSED
                        || appStatus == ApplicationStatus.SELECTED
                        || appStatus == ApplicationStatus.BATCH_ASSIGNED) {
                    throw new IllegalStateException("Soft-Skill / HR interview has already been evaluated for this candidate.");
                }
                if (appStatus != ApplicationStatus.TECHNICAL_INTERVIEW_PASSED
                        && appStatus != ApplicationStatus.HR_INTERVIEW_SCHEDULED) {
                    throw new IllegalStateException(
                            "Candidate must pass Technical Interview before taking Soft-Skill/HR Interview. Current status: " + appStatus);
                }
            } else if (student != null) {
                SelectionStatus currentStatus = student.getSelectionStatus();
                if (currentStatus != SelectionStatus.SOFT_SKILL_PENDING) {
                    throw new IllegalStateException(
                            "Student is not eligible for soft-skill interview. Current status: " + currentStatus);
                }
            }
        } else {
            throw new IllegalArgumentException(
                    "Invalid interview type: " + interviewType);
        }
    }


    // =========================================================
    // UPDATE STUDENT & APPLICATION SELECTION STATUS
    // =========================================================

    private void updateStudentSelectionStatus(
            Student student,
            String interviewType,
            String status,
            String remarks,
            Optional<Application> appOpt) {

        // Interview failed
        if ("REJECTED".equals(status)) {
            if (student != null) {
                student.setSelectionStatus(SelectionStatus.REJECTED);
            }
            if (appOpt != null && appOpt.isPresent()) {
                Application app = appOpt.get();
                if ("TECHNICAL".equals(interviewType)) {
                    app.setStatus(ApplicationStatus.TECHNICAL_INTERVIEW_FAILED);
                    app.setTechnicalInterviewRemarks(remarks);
                } else if ("SOFT_SKILL".equals(interviewType)) {
                    app.setStatus(ApplicationStatus.HR_INTERVIEW_FAILED);
                    app.setHrInterviewRemarks(remarks);
                }
                app.setUpdatedAt(LocalDateTime.now());
                applicationRepository.save(app);
            }
        }
        // Technical interview passed
        else if ("TECHNICAL".equals(interviewType)) {
            if (student != null) {
                student.setSelectionStatus(SelectionStatus.SOFT_SKILL_PENDING);
            }
            if (appOpt != null && appOpt.isPresent()) {
                Application app = appOpt.get();
                app.setStatus(ApplicationStatus.TECHNICAL_INTERVIEW_PASSED);
                app.setTechnicalInterviewRemarks(remarks);
                app.setUpdatedAt(LocalDateTime.now());
                applicationRepository.save(app);
            }
        }
        // Soft skill interview passed
        else if ("SOFT_SKILL".equals(interviewType)) {
            if (student != null) {
                student.setSelectionStatus(SelectionStatus.HOME_VISIT_PENDING);
            }
            if (appOpt != null && appOpt.isPresent()) {
                Application app = appOpt.get();
                app.setStatus(ApplicationStatus.HR_INTERVIEW_PASSED);
                app.setHrInterviewRemarks(remarks);
                app.setUpdatedAt(LocalDateTime.now());
                applicationRepository.save(app);
            }
        }

        if (student != null) {
            student.setUpdatedAt(LocalDateTime.now());
            studentRepository.save(student);
        }
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

    @Override
    public List<ApplicationResponse> getEligibleInterviewCandidates(String trainerEmail) {
        return getEligibleInterviewCandidates(trainerEmail, null);
    }

    @Override
    public List<ApplicationResponse> getEligibleInterviewCandidates(String trainerEmail, String stage) {
        log.info("Fetching eligible interview candidates for trainer: '{}', stage: '{}'", trainerEmail, stage);
        User trainer = null;
        if (trainerEmail != null && !trainerEmail.isBlank()) {
            trainer = userRepository.findByEmail(trainerEmail)
                    .or(() -> userRepository.findById(trainerEmail))
                    .orElse(null);
        }

        TrainerType trainerType = (trainer != null) ? trainer.getTrainerType() : null;
        if (stage != null && !stage.isBlank()) {
            if ("SOFT_SKILL".equalsIgnoreCase(stage) || "HR".equalsIgnoreCase(stage)) {
                trainerType = TrainerType.SOFT_SKILLS;
            } else if ("TECHNICAL".equalsIgnoreCase(stage)) {
                trainerType = TrainerType.TECHNICAL;
            }
        }

        final TrainerType effectiveType = trainerType;

        List<Application> allApps = applicationRepository.findAll();
        if (allApps.isEmpty()) {
            return Collections.emptyList();
        }

        return allApps.stream()
                .filter(app -> {
                    if (app.getStatus() == null) return false;
                    if (effectiveType == TrainerType.SOFT_SKILLS) {
                        return app.getStatus() == ApplicationStatus.TECHNICAL_INTERVIEW_PASSED
                                || app.getStatus() == ApplicationStatus.HR_INTERVIEW_SCHEDULED;
                    } else if (effectiveType == TrainerType.TECHNICAL) {
                        return app.getStatus() == ApplicationStatus.DOCUMENTS_VERIFIED
                                || app.getStatus() == ApplicationStatus.TECHNICAL_INTERVIEW_SCHEDULED;
                    } else {
                        // Admin or unassigned trainer
                        return app.getStatus() == ApplicationStatus.DOCUMENTS_VERIFIED
                                || app.getStatus() == ApplicationStatus.TECHNICAL_INTERVIEW_SCHEDULED
                                || app.getStatus() == ApplicationStatus.TECHNICAL_INTERVIEW_PASSED
                                || app.getStatus() == ApplicationStatus.HR_INTERVIEW_SCHEDULED;
                    }
                })
                .map(this::mapApplicationToResponse)
                .collect(Collectors.toList());
    }

    private ApplicationResponse mapApplicationToResponse(Application app) {
        if (app == null) return null;
        return ApplicationResponse.builder()
                .id(app.getId())
                .applicationNumber(app.getApplicationNumber())
                .status(app.getStatus())
                .fullName(app.getFullName())
                .email(app.getEmail())
                .mobile(app.getMobile())
                .collegeName(app.getCollegeName())
                .branch(app.getBranch())
                .yearOfStudy(app.getYearOfStudy())
                .familyIncome(app.getFamilyIncome())
                .interestedInITEP(app.getInterestedInITEP())
                .joinedWhatsappGroup(app.getJoinedWhatsappGroup())
                .adminRemarks(app.getAdminRemarks())
                .createdAt(app.getCreatedAt())
                .build();
    }
}