package com.finalproject.studentprogresstracker.service;

import java.util.List;

import com.finalproject.studentprogresstracker.dto.request.AptitudeSubmitRequest;
import com.finalproject.studentprogresstracker.dto.response.AptitudeQuestionResponse;
import com.finalproject.studentprogresstracker.dto.response.AptitudeResultResponse;

public interface AptitudeService {

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