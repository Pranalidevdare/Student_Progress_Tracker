package com.example.SPT.service;

import com.example.SPT.dto.response.PerformanceResponse;

public interface PerformanceService {

    PerformanceResponse getPerformance(String studentId);

    PerformanceResponse updatePerformance(String studentId);

}