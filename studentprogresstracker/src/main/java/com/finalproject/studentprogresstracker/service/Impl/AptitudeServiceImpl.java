package com.finalproject.studentprogresstracker.service.Impl;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.finalproject.studentprogresstracker.dto.request.AptitudeAnswerRequest;
import com.finalproject.studentprogresstracker.dto.request.AptitudeSubmitRequest;
import com.finalproject.studentprogresstracker.dto.response.AptitudeQuestionResponse;
import com.finalproject.studentprogresstracker.dto.response.AptitudeResultResponse;
import com.finalproject.studentprogresstracker.entity.AptitudeQuestion;
import com.finalproject.studentprogresstracker.entity.AptitudeResult;
import com.finalproject.studentprogresstracker.entity.SelectionStatus;
import com.finalproject.studentprogresstracker.entity.Student;
import com.finalproject.studentprogresstracker.mapper.AptitudeQuestionMapper;
import com.finalproject.studentprogresstracker.mapper.AptitudeResultMapper;
import com.finalproject.studentprogresstracker.repository.AptitudeQuestionRepository;
import com.finalproject.studentprogresstracker.repository.AptitudeResultRepository;
import com.finalproject.studentprogresstracker.repository.StudentRepository;
import com.finalproject.studentprogresstracker.service.AptitudeService;

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

    private final StudentRepository studentRepository;

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

        if (candidateId == null || candidateId.isBlank()) {

            throw new IllegalArgumentException(
                    "Candidate ID is required");
        }

        Student student =
                studentRepository.findById(candidateId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Candidate not found with id: "
                                                + candidateId));


        // -----------------------------------------------------
        // Check selection status
        // -----------------------------------------------------

        SelectionStatus selectionStatus =
                student.getSelectionStatus();

        if (selectionStatus == null) {

            throw new IllegalStateException(
                    "Candidate selection status is not available");
        }


        // -----------------------------------------------------
        // If aptitude is already in progress
        // -----------------------------------------------------

        if (selectionStatus
                == SelectionStatus.APTITUDE_IN_PROGRESS) {

            AptitudeResult existingResult =
                    aptitudeResultRepository
                            .findTopByCandidateIdAndStatusOrderByCreatedAtDesc(
                                    candidateId,
                                    STATUS_IN_PROGRESS)
                            .orElseThrow(() ->
                                    new IllegalStateException(
                                            "Aptitude test is marked as "
                                                    + "in progress but no active "
                                                    + "attempt was found"));

            // ---------------------------------------------------------
            // Check whether the existing aptitude attempt has expired
            // ---------------------------------------------------------

            LocalDateTime now = LocalDateTime.now();

            if (existingResult.getStartedAt() == null) {

                throw new IllegalStateException(
                        "Aptitude test start time is missing");
            }

            Duration elapsedTime =
                    Duration.between(
                            existingResult.getStartedAt(),
                            now);

            if (elapsedTime.toMinutes()
                    >= APTITUDE_DURATION_MINUTES) {

                // Mark aptitude attempt as failed
                existingResult.setStatus(STATUS_FAIL);

                existingResult.setSubmittedAt(now);

                existingResult.setEvaluatedAt(now);

                existingResult.setUpdatedAt(now);

                aptitudeResultRepository.save(existingResult);

                // Candidate is rejected because aptitude expired
                student.setSelectionStatus(
                        SelectionStatus.REJECTED);

                student.setUpdatedAt(now);

                studentRepository.save(student);

                throw new IllegalStateException(
                        "Aptitude test time has expired");
            }

            // ---------------------------------------------------------
            // Still within the allowed time
            // ---------------------------------------------------------

            return aptitudeResultMapper
                    .toResponse(existingResult);
        }


        // -----------------------------------------------------
        // Candidate must be pending
        // -----------------------------------------------------

        if (selectionStatus
                != SelectionStatus.APTITUDE_PENDING) {

            throw new IllegalStateException(
                    "Candidate is not eligible to start aptitude test. "
                            + "Current status: "
                            + selectionStatus);
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
        // Real start time
        // -----------------------------------------------------

        LocalDateTime now =
                LocalDateTime.now();


        // -----------------------------------------------------
        // Create IN_PROGRESS result
        // -----------------------------------------------------

        AptitudeResult result =
                AptitudeResult.builder()

                        .candidateId(candidateId)

                        .candidateName(
                                buildStudentName(student))

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


        // -----------------------------------------------------
        // Update candidate status
        // -----------------------------------------------------

        student.setSelectionStatus(
                SelectionStatus.APTITUDE_IN_PROGRESS);

        student.setUpdatedAt(now);

        studentRepository.save(student);


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

        if (request.getCandidateId() == null
                || request.getCandidateId().isBlank()) {

            throw new IllegalArgumentException(
                    "Candidate ID is required");
        }

        if (request.getAssessmentId() == null
                || request.getAssessmentId().isBlank()) {

            throw new IllegalArgumentException(
                    "Assessment ID is required");
        }


        // -----------------------------------------------------
        // 2. Find candidate
        // -----------------------------------------------------

        Student student =
                studentRepository.findById(
                        request.getCandidateId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Candidate not found with id: "
                                                + request.getCandidateId()));


        // -----------------------------------------------------
        // 3. Candidate must be IN_PROGRESS
        // -----------------------------------------------------

        if (student.getSelectionStatus()
                != SelectionStatus.APTITUDE_IN_PROGRESS) {

            throw new IllegalStateException(
                    "Candidate has not started the aptitude test. "
                            + "Current status: "
                            + student.getSelectionStatus());
        }


        // -----------------------------------------------------
        // 4. Find current aptitude attempt
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
        // 5. Check aptitude timer
        // -----------------------------------------------------

        LocalDateTime now =
                LocalDateTime.now();

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

            student.setSelectionStatus(
                    SelectionStatus.REJECTED);

            student.setUpdatedAt(now);

            studentRepository.save(student);

            throw new IllegalStateException(
                    "Aptitude test time has expired");
        }


        // -----------------------------------------------------
        // 6. Get active questions
        // -----------------------------------------------------

        List<AptitudeQuestion> questions =
                aptitudeQuestionRepository
                        .findByActiveTrue();

        if (questions.isEmpty()) {

            throw new IllegalStateException(
                    "No active aptitude questions are available");
        }


        // -----------------------------------------------------
        // 7. Create question map
        // -----------------------------------------------------

        Map<String, AptitudeQuestion> questionMap =
                questions.stream()
                        .collect(Collectors.toMap(
                                AptitudeQuestion::getId,
                                question -> question));


        // -----------------------------------------------------
        // 8. Get submitted answers
        // -----------------------------------------------------

        List<AptitudeAnswerRequest> answers =
                request.getAnswers() == null
                        ? List.of()
                        : request.getAnswers();


        // -----------------------------------------------------
        // 9. Prevent duplicate answers
        // -----------------------------------------------------

        Set<String> answeredQuestionIds =
                new HashSet<>();

        int attemptedQuestions = 0;

        int correctAnswers = 0;

        int wrongAnswers = 0;

        int marksObtained = 0;


        // -----------------------------------------------------
        // 10. Calculate total marks
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
        // 11. Evaluate answers
        // -----------------------------------------------------

        for (AptitudeAnswerRequest answer : answers) {

            if (answer == null
                    || answer.getQuestionId() == null
                    || answer.getQuestionId().isBlank()) {

                continue;
            }

            String questionId =
                    answer.getQuestionId();


            // Duplicate answer
            if (!answeredQuestionIds.add(questionId)) {

                throw new IllegalArgumentException(
                        "Duplicate answer submitted for question: "
                                + questionId);
            }


            // Validate question
            AptitudeQuestion question =
                    questionMap.get(questionId);

            if (question == null) {

                throw new IllegalArgumentException(
                        "Invalid aptitude question ID: "
                                + questionId);
            }


            String selectedAnswer =
                    answer.getSelectedAnswer();


            // Blank answer = unattempted
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
        // 12. Calculate unattempted
        // -----------------------------------------------------

        int totalQuestions =
                questions.size();

        int unattemptedQuestions =
                totalQuestions - attemptedQuestions;


        // -----------------------------------------------------
        // 13. Calculate percentage
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
        // 14. Determine PASS / FAIL
        // -----------------------------------------------------

        String status;

        if (percentage >= PASSING_PERCENTAGE) {

            status = STATUS_PASS;

        } else {

            status = STATUS_FAIL;
        }


        // -----------------------------------------------------
        // 15. Update SAME aptitude result
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

        /*
         * Do NOT change startedAt.
         */
        result.setSubmittedAt(now);

        result.setEvaluatedAt(now);

        result.setUpdatedAt(now);


        // -----------------------------------------------------
        // 16. Save result
        // -----------------------------------------------------

        AptitudeResult savedResult =
                aptitudeResultRepository
                        .save(result);


        // -----------------------------------------------------
        // 17. Update selection status
        // -----------------------------------------------------

        if (STATUS_PASS.equals(status)) {

            student.setSelectionStatus(
                    SelectionStatus.TECHNICAL_PENDING);

        } else {

            student.setSelectionStatus(
                    SelectionStatus.REJECTED);
        }

        student.setUpdatedAt(now);

        studentRepository.save(student);


        // -----------------------------------------------------
        // 18. Return result
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

        if (candidateId == null
                || candidateId.isBlank()) {

            throw new IllegalArgumentException(
                    "Candidate ID is required");
        }

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