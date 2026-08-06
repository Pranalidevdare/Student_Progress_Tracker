package com.finalproject.studentprogresstracker.service.Impl;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.finalproject.studentprogresstracker.dto.response.PerformanceResponse;
import com.finalproject.studentprogresstracker.entity.Performance;
import com.finalproject.studentprogresstracker.mapper.PerformanceMapper;
import com.finalproject.studentprogresstracker.repository.PerformanceRepository;
import com.finalproject.studentprogresstracker.service.PerformanceService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PerformanceServiceImpl implements PerformanceService {

    private final PerformanceRepository performanceRepository;

    private final PerformanceMapper performanceMapper;

    @Override
    public PerformanceResponse getPerformance(String studentId) {

        Performance performance = performanceRepository.findByStudentId(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Performance not found for Student Id : " + studentId));

        return performanceMapper.toResponse(performance);
    }

    @Override
    public PerformanceResponse updatePerformance(String studentId) {

        Performance performance = performanceRepository.findByStudentId(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Performance not found for Student Id : " + studentId));

        /*
         * Calculate Overall Performance
         *
         * Formula:
         * Attendance 25%
         * Assignment 25%
         * Assessment 30%
         * Interview 20%
         */

        double overallPercentage =
                (performance.getAttendancePercentage() * 0.25)
              + (performance.getAssignmentPercentage() * 0.25)
              + (performance.getAssessmentPercentage() * 0.30)
              + (performance.getInterviewPercentage() * 0.20);

        performance.setOverallPercentage(overallPercentage);

        // Performance Status

        if (overallPercentage >= 85) {

            performance.setPerformanceStatus("EXCELLENT");

        } else if (overallPercentage >= 70) {

            performance.setPerformanceStatus("GOOD");

        } else if (overallPercentage >= 50) {

            performance.setPerformanceStatus("AVERAGE");

        } else {

            performance.setPerformanceStatus("NEEDS_IMPROVEMENT");

        }

        performance.setUpdatedAt(LocalDateTime.now());

        Performance updatedPerformance =
                performanceRepository.save(performance);

        return performanceMapper.toResponse(updatedPerformance);

    }

}