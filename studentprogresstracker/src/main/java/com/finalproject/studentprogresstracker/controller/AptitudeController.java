package com.finalproject.studentprogresstracker.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finalproject.studentprogresstracker.dto.request.AptitudeSubmitRequest;
import com.finalproject.studentprogresstracker.dto.response.AptitudeQuestionResponse;
import com.finalproject.studentprogresstracker.dto.response.AptitudeResultResponse;
import com.finalproject.studentprogresstracker.service.AptitudeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/aptitude")
@RequiredArgsConstructor
public class AptitudeController {

    private final AptitudeService aptitudeService;


    // =========================================================
    // GET ACTIVE APTITUDE QUESTIONS
    // =========================================================

    @GetMapping("/questions")
    public ResponseEntity<List<AptitudeQuestionResponse>> getQuestions() {

        List<AptitudeQuestionResponse> questions =
                aptitudeService.getActiveQuestions();

        return ResponseEntity.ok(questions);
    }


    // =========================================================
    // START APTITUDE TEST
    // =========================================================

    @PostMapping("/start/{candidateId}")
    public ResponseEntity<AptitudeResultResponse> startAptitude(
            @PathVariable String candidateId) {

        AptitudeResultResponse result =
                aptitudeService.startAptitude(candidateId);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(result);
    }


    // =========================================================
    // SUBMIT APTITUDE QUIZ
    // =========================================================

    @PostMapping("/submit")
    public ResponseEntity<AptitudeResultResponse> submitQuiz(
            @RequestBody AptitudeSubmitRequest request) {

        AptitudeResultResponse result =
                aptitudeService.submitQuiz(request);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(result);
    }


    // =========================================================
    // GET LATEST APTITUDE RESULT
    // =========================================================

    @GetMapping("/result/{candidateId}")
    public ResponseEntity<AptitudeResultResponse> getLatestResult(
            @PathVariable String candidateId) {

        AptitudeResultResponse result =
                aptitudeService.getLatestResult(candidateId);

        return ResponseEntity.ok(result);
    }
}