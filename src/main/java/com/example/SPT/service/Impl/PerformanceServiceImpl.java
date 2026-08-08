package com.example.SPT.service.Impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.SPT.dto.response.PerformanceResponse;
import com.example.SPT.entity.Performance;
import com.example.SPT.enums.PerformanceStatus;
import com.example.SPT.mapper.PerformanceMapper;
import com.example.SPT.repository.PerformanceRepository;
import com.example.SPT.service.PerformanceService;

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

        // Validate Percentage Values

        double attendance = validatePercentage(
                performance.getAttendancePercentage(),
                "Attendance Percentage");

        double assignment = validatePercentage(
                performance.getAssignmentPercentage(),
                "Assignment Percentage");

        double assessment = validatePercentage(
                performance.getAssessmentPercentage(),
                "Assessment Percentage");

        double interview = validatePercentage(
                performance.getInterviewPercentage(),
                "Interview Percentage");

        // Calculate Overall Percentage

        double overallPercentage =
                (attendance * 0.25)
              + (assignment * 0.25)
              + (assessment * 0.30)
              + (interview * 0.20);

        // Round to 2 Decimal Places

        overallPercentage = Math.round(overallPercentage * 100.0) / 100.0;

        performance.setOverallPercentage(overallPercentage);

        // Set Performance Status

        if (overallPercentage >= 85) {

        	performance.setPerformanceStatus(
        	        PerformanceStatus.EXCELLENT);

        } else if (overallPercentage >= 70) {

        	performance.setPerformanceStatus(
        	        PerformanceStatus.GOOD);

        } else if (overallPercentage >= 50) {

        	performance.setPerformanceStatus(
        	        PerformanceStatus.AVERAGE);
        } else {

        	performance.setPerformanceStatus(
        	        PerformanceStatus.NEEDS_IMPROVEMENT);
        }

        performance.setUpdatedAt(LocalDateTime.now());

        Performance updatedPerformance =
                performanceRepository.save(performance);

        // Update Student Rankings

        updateRanks();

        return performanceMapper.toResponse(updatedPerformance);
    }

    /**
     * Updates the rank of all students based on Overall Percentage.
     * Students having the same Overall Percentage receive the same rank.
     */
    private void updateRanks() {

        List<Performance> performances =
                performanceRepository.findAllByOrderByOverallPercentageDesc();

        int rank = 1;
        Double previousPercentage = null;

        for (int i = 0; i < performances.size(); i++) {

            Performance performance = performances.get(i);

            if (previousPercentage != null
                    && performance.getOverallPercentage().equals(previousPercentage)) {

                performance.setRank(rank);

            } else {

                rank = i + 1;
                performance.setRank(rank);
                previousPercentage = performance.getOverallPercentage();
            }
        }

        performanceRepository.saveAll(performances);
    }

    /**
     * Validates percentage values.
     * Returns 0 if value is null.
     * Throws exception if percentage is outside 0-100.
     */
    private double validatePercentage(Double percentage, String fieldName) {

        if (percentage == null) {
            return 0.0;
        }

        if (percentage < 0 || percentage > 100) {

            throw new IllegalArgumentException(
                    fieldName + " must be between 0 and 100");
        }

        return percentage;
    }
}