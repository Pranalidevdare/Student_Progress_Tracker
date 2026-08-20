package com.example.SPT.service;

import java.util.List;

import com.example.SPT.dto.request.AptitudeSubmitRequest;
import com.example.SPT.dto.response.AptitudeEligibilityResponse;
import com.example.SPT.dto.response.AptitudeQuestionResponse;
import com.example.SPT.dto.response.AptitudeResultResponse;

public interface AptitudeService {

    /*
     * Check candidate aptitude eligibility and attempt status.
     */
    AptitudeEligibilityResponse checkEligibility(
            String candidateId);

    /*
     * Get questions available for the aptitude test.
     */
    List<AptitudeQuestionResponse> getActiveQuestions();

    /*
     * Start the aptitude test.
     */
    AptitudeResultResponse startAptitude(
            String candidateId);

    /*
     * Submit and automatically evaluate the aptitude test.
     */
    AptitudeResultResponse submitQuiz(
            AptitudeSubmitRequest request);

    /*
     * Get latest aptitude result of a candidate.
     */
    AptitudeResultResponse getLatestResult(
            String candidateId);
}