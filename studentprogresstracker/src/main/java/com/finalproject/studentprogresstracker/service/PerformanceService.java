package com.finalproject.studentprogresstracker.service;

import com.finalproject.studentprogresstracker.dto.response.PerformanceResponse;

public interface PerformanceService {

    PerformanceResponse getPerformance(String studentId);

    PerformanceResponse updatePerformance(String studentId);

}