package com.finalproject.studentprogresstracker.service;

import com.finalproject.studentprogresstracker.dto.request.InterviewRequest;
import com.finalproject.studentprogresstracker.dto.response.InterviewResponse;

public interface InterviewService {

    InterviewResponse conductInterview(InterviewRequest request);

    InterviewResponse updateInterview(String id, InterviewRequest request);

    InterviewResponse getInterviewByStudent(String studentId);

}