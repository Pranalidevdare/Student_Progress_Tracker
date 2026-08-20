package com.example.SPT.service.Impl;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.SPT.dto.request.AptitudeAnswerRequest;
import com.example.SPT.dto.request.AptitudeSubmitRequest;
import com.example.SPT.dto.response.AptitudeEligibilityResponse;
import com.example.SPT.dto.response.AptitudeQuestionResponse;
import com.example.SPT.dto.response.AptitudeResultResponse;
import com.example.SPT.entity.Application;
import com.example.SPT.entity.AptitudeQuestion;
import com.example.SPT.entity.AptitudeResult;
import com.example.SPT.enums.ApplicationStatus;
import com.example.SPT.exception.ResourceNotFoundException;
import com.example.SPT.mapper.AptitudeQuestionMapper;
import com.example.SPT.mapper.AptitudeResultMapper;
import com.example.SPT.repository.ApplicationRepository;
import com.example.SPT.repository.AptitudeQuestionRepository;
import com.example.SPT.repository.AptitudeResultRepository;
import com.example.SPT.service.AptitudeService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AptitudeServiceImpl implements AptitudeService {

    private static final double PASSING_PERCENTAGE = 40.0;

    private static final long APTITUDE_DURATION_MINUTES = 30;

    private static final String ASSESSMENT_TYPE = "APTITUDE";

    private static final String STATUS_IN_PROGRESS = "IN_PROGRESS";
    private static final String STATUS_PASS = "PASS";
    private static final String STATUS_FAIL = "FAIL";

    private final AptitudeQuestionRepository aptitudeQuestionRepository;

    private final ApplicationRepository applicationRepository;

    private final AptitudeResultRepository aptitudeResultRepository;

    private final com.example.SPT.repository.AptitudeScheduleRepository aptitudeScheduleRepository;

    private final AptitudeQuestionMapper aptitudeQuestionMapper;

    private final AptitudeResultMapper aptitudeResultMapper;


    // =========================================================
    // CHECK ELIGIBILITY & ATTEMPT STATUS
    // =========================================================

    @Override
    public AptitudeEligibilityResponse checkEligibility(String candidateId) {
        validateCandidateId(candidateId);
        Application application = getApplication(candidateId);

        List<String> lookupIds = List.of(
                application.getId(),
                application.getApplicationNumber() != null ? application.getApplicationNumber() : candidateId
        );

        AptitudeResult previousCompletedResult = aptitudeResultRepository
                .findTopByCandidateIdInAndStatusInOrderByCreatedAtDesc(lookupIds, List.of(STATUS_PASS, STATUS_FAIL))
                .orElse(null);

        ApplicationStatus currentStatus = application.getStatus();
        boolean hasCompletedStatus = (currentStatus == ApplicationStatus.APTITUDE_PASSED
                || currentStatus == ApplicationStatus.APTITUDE_FAILED
                || currentStatus == ApplicationStatus.DOCUMENTATION_PENDING
                || currentStatus == ApplicationStatus.DOCUMENTS_SUBMITTED
                || currentStatus == ApplicationStatus.DOCUMENTS_VERIFIED
                || currentStatus == ApplicationStatus.TECHNICAL_INTERVIEW_SCHEDULED
                || currentStatus == ApplicationStatus.TECHNICAL_INTERVIEW_PASSED
                || currentStatus == ApplicationStatus.HR_INTERVIEW_SCHEDULED
                || currentStatus == ApplicationStatus.HR_INTERVIEW_PASSED
                || currentStatus == ApplicationStatus.SELECTED
                || currentStatus == ApplicationStatus.BATCH_ASSIGNED);

        if (previousCompletedResult != null || hasCompletedStatus) {
            AptitudeResultResponse resDto = previousCompletedResult != null
                    ? aptitudeResultMapper.toResponse(previousCompletedResult)
                    : null;

            return AptitudeEligibilityResponse.builder()
                    .eligible(false)
                    .alreadyAttempted(true)
                    .scheduled(true)
                    .canStart(false)
                    .candidateId(application.getApplicationNumber())
                    .candidateName(application.getFullName())
                    .applicationStatus(currentStatus != null ? currentStatus.name() : null)
                    .message("You have already given the aptitude test.")
                    .previousResult(resDto)
                    .build();
        }

        if (currentStatus != ApplicationStatus.APTITUDE_SCHEDULED) {
            String message;
            if (currentStatus == ApplicationStatus.ELIGIBLE_FOR_APTITUDE || currentStatus == ApplicationStatus.SUBMITTED) {
                message = "Aptitude test has not been scheduled yet. Please wait for the administrator to schedule your test.";
            } else if (currentStatus == ApplicationStatus.NOT_ELIGIBLE) {
                message = "Candidate is not eligible for the aptitude test (Family income criteria not met).";
            } else {
                message = "Aptitude test has not been scheduled yet.";
            }

            return AptitudeEligibilityResponse.builder()
                    .eligible(false)
                    .alreadyAttempted(false)
                    .scheduled(false)
                    .canStart(false)
                    .candidateId(application.getApplicationNumber())
                    .candidateName(application.getFullName())
                    .applicationStatus(currentStatus != null ? currentStatus.name() : "UNKNOWN")
                    .message(message)
                    .build();
        }

        // Active schedule lookup
        com.example.SPT.entity.AptitudeSchedule schedule = aptitudeScheduleRepository
                .findTopByOrderByCreatedAtDesc()
                .orElse(null);

        java.time.ZoneId istZone = java.time.ZoneId.of("Asia/Kolkata");
        LocalDateTime now = LocalDateTime.now(istZone);

        // Check if there is an ongoing IN_PROGRESS attempt
        AptitudeResult inProgressAttempt = aptitudeResultRepository
                .findTopByCandidateIdInAndStatusOrderByCreatedAtDesc(lookupIds, STATUS_IN_PROGRESS)
                .orElse(null);

        if (inProgressAttempt != null && inProgressAttempt.getStartedAt() != null) {
            long remainingSecs = Math.max(0, Duration.between(now, inProgressAttempt.getStartedAt().plusMinutes(APTITUDE_DURATION_MINUTES)).getSeconds());
            if (remainingSecs <= 0) {
                inProgressAttempt.setStatus(STATUS_FAIL);
                inProgressAttempt.setSubmittedAt(now);
                inProgressAttempt.setEvaluatedAt(now);
                inProgressAttempt.setUpdatedAt(now);
                aptitudeResultRepository.save(inProgressAttempt);
                application.setStatus(ApplicationStatus.APTITUDE_FAILED);
                applicationRepository.save(application);

                return AptitudeEligibilityResponse.builder()
                        .eligible(false)
                        .alreadyAttempted(true)
                        .scheduled(true)
                        .canStart(false)
                        .candidateId(application.getApplicationNumber())
                        .candidateName(application.getFullName())
                        .applicationStatus(ApplicationStatus.APTITUDE_FAILED.name())
                        .message("Aptitude test time has expired. You have already completed this attempt.")
                        .previousResult(aptitudeResultMapper.toResponse(inProgressAttempt))
                        .build();
            }

            AptitudeResultResponse currAttemptDto = aptitudeResultMapper.toResponse(inProgressAttempt);
            currAttemptDto.setRemainingSeconds(remainingSecs);
            currAttemptDto.setDurationMinutes(APTITUDE_DURATION_MINUTES);
            currAttemptDto.setExpiresAt(inProgressAttempt.getStartedAt().plusMinutes(APTITUDE_DURATION_MINUTES));

            return AptitudeEligibilityResponse.builder()
                    .eligible(true)
                    .alreadyAttempted(false)
                    .scheduled(true)
                    .canStart(true)
                    .candidateId(application.getApplicationNumber())
                    .candidateName(application.getFullName())
                    .applicationStatus(currentStatus.name())
                    .hasInProgressAttempt(true)
                    .remainingSecondsForExam(remainingSecs)
                    .currentAttempt(currAttemptDto)
                    .message("Exam in progress. You can resume your attempt.")
                    .build();
        }

        if (schedule != null && schedule.getTestDate() != null && schedule.getStartTime() != null) {
            LocalDateTime scheduledStart = LocalDateTime.of(schedule.getTestDate(), schedule.getStartTime());
            if (now.isBefore(scheduledStart)) {
                long remainingSecsToStart = Duration.between(now, scheduledStart).getSeconds();
                String formattedDate = schedule.getTestDate().format(java.time.format.DateTimeFormatter.ofPattern("dd MMMM yyyy"));
                String formattedTime = schedule.getStartTime().format(java.time.format.DateTimeFormatter.ofPattern("hh:mm a"));

                return AptitudeEligibilityResponse.builder()
                        .eligible(false)
                        .alreadyAttempted(false)
                        .scheduled(true)
                        .canStart(false)
                        .candidateId(application.getApplicationNumber())
                        .candidateName(application.getFullName())
                        .applicationStatus(currentStatus.name())
                        .testDate(schedule.getTestDate())
                        .startTime(schedule.getStartTime())
                        .endTime(schedule.getEndTime())
                        .durationMinutes(APTITUDE_DURATION_MINUTES)
                        .scheduledStartDateTime(scheduledStart.toString())
                        .remainingSecondsToStart(remainingSecsToStart)
                        .message("Aptitude Exam Scheduled. Your exam starts on " + formattedDate + " at " + formattedTime + ".")
                        .build();
            }
        }

        return AptitudeEligibilityResponse.builder()
                .eligible(true)
                .alreadyAttempted(false)
                .scheduled(true)
                .canStart(true)
                .candidateId(application.getApplicationNumber())
                .candidateName(application.getFullName())
                .applicationStatus(currentStatus.name())
                .testDate(schedule != null ? schedule.getTestDate() : null)
                .startTime(schedule != null ? schedule.getStartTime() : null)
                .endTime(schedule != null ? schedule.getEndTime() : null)
                .durationMinutes(APTITUDE_DURATION_MINUTES)
                .remainingSecondsToStart(0L)
                .message("Exam schedule verified. Candidate is eligible to take the aptitude test.")
                .build();
    }


    // =========================================================
    // GET ACTIVE QUESTIONS
    // =========================================================

    @Override
    public List<AptitudeQuestionResponse> getActiveQuestions() {

        return aptitudeQuestionRepository
                .findByActiveTrue()
                .stream()
                .map(aptitudeQuestionMapper::toResponse)
                .collect(Collectors.toList());
    }


    // =========================================================
    // START APTITUDE
    // =========================================================

    @Override
    public AptitudeResultResponse startAptitude(
            String candidateId) {

        validateCandidateId(candidateId);

        Application application =
                getApplication(candidateId);

        List<String> lookupIds = List.of(
                application.getId(),
                application.getApplicationNumber() != null ? application.getApplicationNumber() : candidateId
        );

        // -----------------------------------------------------
        // Check if already attempted
        // -----------------------------------------------------

        AptitudeResult previousCompletedResult = aptitudeResultRepository
                .findTopByCandidateIdInAndStatusInOrderByCreatedAtDesc(lookupIds, List.of(STATUS_PASS, STATUS_FAIL))
                .orElse(null);

        ApplicationStatus currentStatus = application.getStatus();
        boolean hasCompletedStatus = (currentStatus == ApplicationStatus.APTITUDE_PASSED
                || currentStatus == ApplicationStatus.APTITUDE_FAILED
                || currentStatus == ApplicationStatus.DOCUMENTATION_PENDING
                || currentStatus == ApplicationStatus.DOCUMENTS_SUBMITTED
                || currentStatus == ApplicationStatus.DOCUMENTS_VERIFIED
                || currentStatus == ApplicationStatus.TECHNICAL_INTERVIEW_SCHEDULED
                || currentStatus == ApplicationStatus.TECHNICAL_INTERVIEW_PASSED
                || currentStatus == ApplicationStatus.HR_INTERVIEW_SCHEDULED
                || currentStatus == ApplicationStatus.HR_INTERVIEW_PASSED
                || currentStatus == ApplicationStatus.SELECTED
                || currentStatus == ApplicationStatus.BATCH_ASSIGNED);

        if (previousCompletedResult != null || hasCompletedStatus) {
            throw new IllegalStateException("You have already given the aptitude test.");
        }

        // -----------------------------------------------------
        // Check application status - Admin Scheduling Required
        // -----------------------------------------------------

        if (currentStatus != ApplicationStatus.APTITUDE_SCHEDULED) {
            if (currentStatus == ApplicationStatus.ELIGIBLE_FOR_APTITUDE || currentStatus == ApplicationStatus.SUBMITTED) {
                throw new IllegalStateException(
                        "Aptitude test has not been scheduled yet. Please wait for the administrator to schedule your exam.");
            }
            throw new IllegalStateException(
                    "Candidate is not eligible to start aptitude test. "
                    + "Current application status: "
                    + currentStatus);
        }


        // -----------------------------------------------------
        // Check schedule start time gate in IST
        // -----------------------------------------------------

        com.example.SPT.entity.AptitudeSchedule schedule = aptitudeScheduleRepository
                .findTopByOrderByCreatedAtDesc()
                .orElse(null);

        java.time.ZoneId istZone = java.time.ZoneId.of("Asia/Kolkata");
        LocalDateTime now = LocalDateTime.now(istZone);

        if (schedule != null && schedule.getTestDate() != null && schedule.getStartTime() != null) {
            LocalDateTime scheduledStart = LocalDateTime.of(schedule.getTestDate(), schedule.getStartTime());
            if (now.isBefore(scheduledStart)) {
                String formattedDate = schedule.getTestDate().format(java.time.format.DateTimeFormatter.ofPattern("dd MMMM yyyy"));
                String formattedTime = schedule.getStartTime().format(java.time.format.DateTimeFormatter.ofPattern("hh:mm a"));
                throw new IllegalStateException("Exam has not started yet. Please wait until the scheduled start time (" + formattedDate + " at " + formattedTime + ").");
            }
        }

        // -----------------------------------------------------
        // Check existing IN_PROGRESS attempt
        // -----------------------------------------------------

        AptitudeResult existingResult =
                aptitudeResultRepository
                        .findTopByCandidateIdInAndStatusOrderByCreatedAtDesc(
                                lookupIds,
                                STATUS_IN_PROGRESS)
                        .orElse(null);


        if (existingResult != null) {

            if (existingResult.getStartedAt() == null) {
                throw new IllegalStateException(
                        "Aptitude test start time is missing");
            }

            Duration elapsedTime =
                    Duration.between(
                            existingResult.getStartedAt(),
                            now);

            // -------------------------------------------------
            // Existing attempt expired
            // -------------------------------------------------

            if (elapsedTime.toMinutes()
                    >= APTITUDE_DURATION_MINUTES) {

                existingResult.setStatus(
                        STATUS_FAIL);

                existingResult.setSubmittedAt(now);

                existingResult.setEvaluatedAt(now);

                existingResult.setUpdatedAt(now);

                aptitudeResultRepository.save(
                        existingResult);


                application.setStatus(
                        ApplicationStatus.APTITUDE_FAILED);

                application.setUpdatedAt(now);

                applicationRepository.save(
                        application);

                throw new IllegalStateException("Aptitude test time has expired. You have already completed this attempt.");
            } else {

                // -------------------------------------------------
                // Existing attempt still active - continue with remaining time
                // -------------------------------------------------

                long remainingSecs = Math.max(0, Duration.between(now, existingResult.getStartedAt().plusMinutes(APTITUDE_DURATION_MINUTES)).getSeconds());
                AptitudeResultResponse res = aptitudeResultMapper.toResponse(existingResult);
                res.setDurationMinutes(APTITUDE_DURATION_MINUTES);
                res.setRemainingSeconds(remainingSecs);
                res.setExpiresAt(existingResult.getStartedAt().plusMinutes(APTITUDE_DURATION_MINUTES));
                return res;
            }
        }


        // -----------------------------------------------------
        // Get active questions
        // -----------------------------------------------------

        List<AptitudeQuestion> questions =
                aptitudeQuestionRepository
                        .findByActiveTrue();


        if (questions.isEmpty()) {

            throw new IllegalStateException(
                    "No active aptitude questions are available");
        }


        // -----------------------------------------------------
        // Calculate total marks
        // -----------------------------------------------------

        int totalMarks = 0;

        for (AptitudeQuestion question : questions) {

            int marks =
                    question.getMarks() == null
                            ? 1
                            : question.getMarks();

            if (marks < 0) {

                throw new IllegalStateException(
                        "Question marks cannot be negative for question: "
                                + question.getId());
            }

            totalMarks += marks;
        }


        // -----------------------------------------------------
        // Create aptitude result with actual start time
        // -----------------------------------------------------

        AptitudeResult result =
                AptitudeResult.builder()

                        .candidateId(candidateId)

                        .candidateName(
                                application.getFullName())

                        .assessmentId(
                                ASSESSMENT_TYPE)

                        .assessmentType(
                                ASSESSMENT_TYPE)

                        .totalQuestions(
                                questions.size())

                        .attemptedQuestions(0)

                        .correctAnswers(0)

                        .wrongAnswers(0)

                        .unattemptedQuestions(
                                questions.size())

                        .marksObtained(0)

                        .totalMarks(totalMarks)

                        .percentage(0.0)

                        .status(
                                STATUS_IN_PROGRESS)

                        .startedAt(now)

                        .submittedAt(null)

                        .evaluatedAt(null)

                        .createdAt(now)

                        .updatedAt(now)

                        .build();


        AptitudeResult savedResult =
                aptitudeResultRepository.save(result);

        AptitudeResultResponse res = aptitudeResultMapper.toResponse(savedResult);
        res.setDurationMinutes(APTITUDE_DURATION_MINUTES);
        res.setRemainingSeconds(APTITUDE_DURATION_MINUTES * 60);
        res.setExpiresAt(now.plusMinutes(APTITUDE_DURATION_MINUTES));
        return res;
    }


    // =========================================================
    // SUBMIT APTITUDE QUIZ
    // =========================================================

    @Override
    public AptitudeResultResponse submitQuiz(
            AptitudeSubmitRequest request) {


        // -----------------------------------------------------
        // 1. Validate request
        // -----------------------------------------------------

        if (request == null) {

            throw new IllegalArgumentException(
                    "Aptitude submission request cannot be null");
        }


        validateCandidateId(
                request.getCandidateId());


        if (request.getAssessmentId() == null
                || request.getAssessmentId().isBlank()) {

            throw new IllegalArgumentException(
                    "Assessment ID is required");
        }


        // -----------------------------------------------------
        // 2. Find application
        // -----------------------------------------------------

        Application application =
                getApplication(
                        request.getCandidateId());

        ApplicationStatus currentStatus = application.getStatus();
        if (currentStatus != ApplicationStatus.APTITUDE_SCHEDULED) {
            if (currentStatus == ApplicationStatus.APTITUDE_PASSED || currentStatus == ApplicationStatus.APTITUDE_FAILED) {
                throw new IllegalStateException("You have already submitted the aptitude test.");
            }
            throw new IllegalStateException("Aptitude test has not been scheduled yet. Current application status: " + currentStatus);
        }

        List<String> lookupIds = List.of(
                application.getId(),
                application.getApplicationNumber() != null ? application.getApplicationNumber() : request.getCandidateId()
        );

        // -----------------------------------------------------
        // 3. Find current aptitude attempt
        // -----------------------------------------------------

        AptitudeResult result =
                aptitudeResultRepository
                        .findTopByCandidateIdInAndStatusOrderByCreatedAtDesc(
                                lookupIds,
                                STATUS_IN_PROGRESS)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "No active in-progress aptitude test found. You may have already submitted the test."));


        // -----------------------------------------------------
        // 4. Check timer
        // -----------------------------------------------------

        LocalDateTime now =
                LocalDateTime.now();


        if (result.getStartedAt() == null) {

            throw new IllegalStateException(
                    "Aptitude test start time is missing");
        }


        Duration elapsedTime =
                Duration.between(
                        result.getStartedAt(),
                        now);


        if (elapsedTime.toMinutes()
                >= APTITUDE_DURATION_MINUTES) {

            result.setSubmittedAt(now);

            result.setEvaluatedAt(now);

            result.setStatus(
                    STATUS_FAIL);

            result.setUpdatedAt(now);

            aptitudeResultRepository.save(result);


            application.setStatus(
                    ApplicationStatus.APTITUDE_FAILED);

            application.setUpdatedAt(now);

            applicationRepository.save(application);


            throw new IllegalStateException(
                    "Aptitude test time has expired");
        }


        // -----------------------------------------------------
        // 5. Get active questions
        // -----------------------------------------------------

        List<AptitudeQuestion> questions =
                aptitudeQuestionRepository
                        .findByActiveTrue();


        if (questions.isEmpty()) {

            throw new IllegalStateException(
                    "No active aptitude questions are available");
        }


        // -----------------------------------------------------
        // 6. Create question map
        // -----------------------------------------------------

        Map<String, AptitudeQuestion> questionMap =
                questions.stream()
                        .collect(Collectors.toMap(
                                AptitudeQuestion::getId,
                                question -> question));


        // -----------------------------------------------------
        // 7. Get submitted answers
        // -----------------------------------------------------

        List<AptitudeAnswerRequest> answers =
                request.getAnswers() == null
                        ? List.of()
                        : request.getAnswers();


        // -----------------------------------------------------
        // 8. Evaluate answers
        // -----------------------------------------------------

        Set<String> answeredQuestionIds =
                new HashSet<>();


        int attemptedQuestions = 0;

        int correctAnswers = 0;

        int wrongAnswers = 0;

        int marksObtained = 0;


        // -----------------------------------------------------
        // 9. Calculate total marks
        // -----------------------------------------------------

        int totalMarks = 0;

        for (AptitudeQuestion question : questions) {

            int questionMarks =
                    question.getMarks() == null
                            ? 1
                            : question.getMarks();


            if (questionMarks < 0) {

                throw new IllegalStateException(
                        "Question marks cannot be negative for question: "
                                + question.getId());
            }


            totalMarks += questionMarks;
        }


        // -----------------------------------------------------
        // 10. Evaluate submitted answers
        // -----------------------------------------------------

        for (AptitudeAnswerRequest answer : answers) {

            if (answer == null
                    || answer.getQuestionId() == null
                    || answer.getQuestionId().isBlank()) {

                continue;
            }


            String questionId =
                    answer.getQuestionId();


            // Prevent duplicate answers
            if (!answeredQuestionIds.add(questionId)) {

                throw new IllegalArgumentException(
                        "Duplicate answer submitted for question: "
                                + questionId);
            }


            // Find question
            AptitudeQuestion question =
                    questionMap.get(questionId);


            if (question == null) {

                throw new IllegalArgumentException(
                        "Invalid aptitude question ID: "
                                + questionId);
            }


            String selectedAnswer =
                    answer.getSelectedAnswer();


            // Blank answer
            if (selectedAnswer == null
                    || selectedAnswer.isBlank()) {

                continue;
            }

            String normalizedSelectedAnswer =
                    normalizeAnswer(
                            selectedAnswer,
                            question);

            attemptedQuestions++;


            String correctedAnswer =
                    normalizeAnswer(
                            question.getCorrectAnswer(),
                            question);


            int questionMarks =
                    question.getMarks() == null
                            ? 1
                            : question.getMarks();


            boolean correct =
                    correctedAnswer != null
                            && !correctedAnswer.isBlank()
                            && correctedAnswer
                                    .equalsIgnoreCase(
                                            normalizedSelectedAnswer);


            if (correct) {

                correctAnswers++;

                marksObtained +=
                        questionMarks;

            } else {

                wrongAnswers++;
            }
        }


        // -----------------------------------------------------
        // 11. Calculate unattempted
        // -----------------------------------------------------

        int totalQuestions =
                questions.size();


        int unattemptedQuestions =
                totalQuestions
                        - attemptedQuestions;


        // -----------------------------------------------------
        // 12. Calculate percentage
        // -----------------------------------------------------

        double percentage = 0.0;


        if (totalMarks > 0) {

            percentage =
                    ((double) marksObtained
                            / totalMarks)
                            * 100.0;
        }


        percentage =
                Math.round(
                        percentage * 100.0)
                        / 100.0;


        // -----------------------------------------------------
        // 13. Determine result
        // -----------------------------------------------------

        String status =
                percentage >= PASSING_PERCENTAGE
                        ? STATUS_PASS
                        : STATUS_FAIL;


        // -----------------------------------------------------
        // 14. Update aptitude result
        // -----------------------------------------------------

        result.setAssessmentId(
                request.getAssessmentId());

        result.setAssessmentType(
                ASSESSMENT_TYPE);

        result.setTotalQuestions(
                totalQuestions);

        result.setAttemptedQuestions(
                attemptedQuestions);

        result.setCorrectAnswers(
                correctAnswers);

        result.setWrongAnswers(
                wrongAnswers);

        result.setUnattemptedQuestions(
                unattemptedQuestions);

        result.setMarksObtained(
                marksObtained);

        result.setTotalMarks(
                totalMarks);

        result.setPercentage(
                percentage);

        result.setStatus(
                status);

        result.setSubmittedAt(now);

        result.setEvaluatedAt(now);

        result.setUpdatedAt(now);


        // -----------------------------------------------------
        // 15. Save aptitude result
        // -----------------------------------------------------

        AptitudeResult savedResult =
                aptitudeResultRepository
                        .save(result);


        // -----------------------------------------------------
        // 16. Update APPLICATION status
        // -----------------------------------------------------

        if (STATUS_PASS.equals(status)) {

            application.setStatus(
                    ApplicationStatus.APTITUDE_PASSED);

        } else {

            application.setStatus(
                    ApplicationStatus.APTITUDE_FAILED);
        }


        application.setUpdatedAt(now);

        applicationRepository.save(application);


        // -----------------------------------------------------
        // 17. Return result
        // -----------------------------------------------------

        return aptitudeResultMapper
                .toResponse(savedResult);
    }


    // =========================================================
    // GET LATEST RESULT
    // =========================================================

    @Override
    public AptitudeResultResponse getLatestResult(
            String candidateId) {

        validateCandidateId(candidateId);


        // Make sure application exists
        Application application = getApplication(candidateId);

        List<String> lookupIds = List.of(
                application.getId(),
                application.getApplicationNumber() != null ? application.getApplicationNumber() : candidateId
        );

        AptitudeResult result =
                aptitudeResultRepository
                        .findTopByCandidateIdInOrderByCreatedAtDesc(
                                lookupIds)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Aptitude result not found for candidate: "
                                                + candidateId));


        return aptitudeResultMapper
                .toResponse(result);
    }


    // =========================================================
    // GET APPLICATION
    // =========================================================

    private Application getApplication(
            String candidateId) {

        return applicationRepository
                .findById(candidateId)
                .or(() -> applicationRepository.findByApplicationNumber(candidateId))
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Application ID not found. Please enter a valid Application ID."));
    }

    private String normalizeAnswer(
            String answer,
            AptitudeQuestion question) {

        if (answer == null) {
            return "";
        }

        String value = answer.trim();

        if (value.isEmpty()) {
            return "";
        }

        String upperValue = value.toUpperCase(Locale.ROOT);

        if (upperValue.matches("[ABCD]")) {
            return upperValue;
        }

        if (upperValue.matches("[0-3]")) {
            return String.valueOf((char) ('A' + Integer.parseInt(upperValue)));
        }

        String[] options = {
                question.getOptionA(),
                question.getOptionB(),
                question.getOptionC(),
                question.getOptionD()
        };

        for (int i = 0; i < options.length; i++) {
            if (options[i] != null && options[i].equalsIgnoreCase(value)) {
                return String.valueOf((char) ('A' + i));
            }
        }

        return upperValue;
    }


    // =========================================================
    // VALIDATE CANDIDATE ID
    // =========================================================

    private void validateCandidateId(
            String candidateId) {

        if (candidateId == null
                || candidateId.isBlank()) {

            throw new IllegalArgumentException(
                    "Candidate ID is required");
        }
    }
}