package com.example.SPT.service.Impl;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.SPT.dto.request.AptitudeAnswerRequest;
import com.example.SPT.dto.request.AptitudeSubmitRequest;
import com.example.SPT.dto.response.AptitudeQuestionResponse;
import com.example.SPT.dto.response.AptitudeResultResponse;
import com.example.SPT.entity.Application;
import com.example.SPT.entity.AptitudeQuestion;
import com.example.SPT.entity.AptitudeResult;
import com.example.SPT.enums.ApplicationStatus;
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

    private static final double PASSING_PERCENTAGE = 60.0;

    private static final long APTITUDE_DURATION_MINUTES = 30;

    private static final String ASSESSMENT_TYPE = "APTITUDE";

    private static final String STATUS_IN_PROGRESS = "IN_PROGRESS";
    private static final String STATUS_PASS = "PASS";
    private static final String STATUS_FAIL = "FAIL";

    private final AptitudeQuestionRepository aptitudeQuestionRepository;

    private final ApplicationRepository applicationRepository;

    private final AptitudeResultRepository aptitudeResultRepository;

    private final AptitudeQuestionMapper aptitudeQuestionMapper;

    private final AptitudeResultMapper aptitudeResultMapper;


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


        // -----------------------------------------------------
        // Check application status
        // -----------------------------------------------------

        if (application.getStatus()
                != ApplicationStatus.APTITUDE_SCHEDULED) {

            throw new IllegalStateException(
                    "Candidate is not eligible to start aptitude test. "
                    + "Current application status: "
                    + application.getStatus());
        }


        // -----------------------------------------------------
        // Check existing IN_PROGRESS attempt
        // -----------------------------------------------------

        AptitudeResult existingResult =
                aptitudeResultRepository
                        .findTopByCandidateIdAndStatusOrderByCreatedAtDesc(
                                candidateId,
                                STATUS_IN_PROGRESS)
                        .orElse(null);


        if (existingResult != null) {

            LocalDateTime now =
                    LocalDateTime.now();

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


                throw new IllegalStateException(
                        "Aptitude test time has expired");
            }


            // -------------------------------------------------
            // Existing attempt still active
            // -------------------------------------------------

            return aptitudeResultMapper
                    .toResponse(existingResult);
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
        // Start time
        // -----------------------------------------------------

        LocalDateTime now =
                LocalDateTime.now();


        // -----------------------------------------------------
        // Create aptitude result
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


        return aptitudeResultMapper
                .toResponse(savedResult);
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


        // -----------------------------------------------------
        // 3. Find current aptitude attempt
        // -----------------------------------------------------

        AptitudeResult result =
                aptitudeResultRepository
                        .findTopByCandidateIdAndStatusOrderByCreatedAtDesc(
                                request.getCandidateId(),
                                STATUS_IN_PROGRESS)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Aptitude test has not been started"));


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


            attemptedQuestions++;


            String correctAnswer =
                    question.getCorrectAnswer();


            int questionMarks =
                    question.getMarks() == null
                            ? 1
                            : question.getMarks();


            boolean correct =
                    correctAnswer != null
                            && correctAnswer
                                    .trim()
                                    .equalsIgnoreCase(
                                            selectedAnswer.trim());


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
        getApplication(candidateId);


        AptitudeResult result =
                aptitudeResultRepository
                        .findTopByCandidateIdOrderByCreatedAtDesc(
                                candidateId)
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
                .orElseThrow(() ->
                        new RuntimeException(
                                "Application not found with id: "
                                        + candidateId));
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