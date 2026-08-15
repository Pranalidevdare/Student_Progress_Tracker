package com.example.SPT.service;

import java.util.List;

import com.example.SPT.dto.request.InterviewRequest;
import com.example.SPT.dto.response.ApplicationResponse;
import com.example.SPT.dto.response.InterviewResponse;

public interface InterviewService {

    InterviewResponse conductInterview(InterviewRequest request);

    InterviewResponse updateInterview(String id, InterviewRequest request);

    InterviewResponse getInterviewByStudent(String studentId);

    List<ApplicationResponse> getEligibleInterviewCandidates(String trainerEmail);

}