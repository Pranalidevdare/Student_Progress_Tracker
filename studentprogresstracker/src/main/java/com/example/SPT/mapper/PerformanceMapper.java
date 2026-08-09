package com.example.SPT.mapper;

import org.springframework.stereotype.Component;

import com.example.SPT.dto.response.PerformanceResponse;
import com.example.SPT.entity.Performance;

@Component
public class PerformanceMapper {

    public PerformanceResponse toResponse(Performance performance) {

        if (performance == null) {
            return null;
        }

        return PerformanceResponse.builder()
                .id(performance.getId())
                .studentId(performance.getStudentId())
                .studentName(performance.getStudentName())
                .batchId(performance.getBatchId())
                .attendancePercentage(performance.getAttendancePercentage())
                .assignmentPercentage(performance.getAssignmentPercentage())
                .assessmentPercentage(performance.getAssessmentPercentage())
                .interviewPercentage(performance.getInterviewPercentage())
                .overallPercentage(performance.getOverallPercentage())
                .rank(performance.getRank())
                .performanceStatus(
                        performance.getPerformanceStatus() != null
                                ? performance.getPerformanceStatus().name()
                                : null)
                .remarks(performance.getRemarks())
                .build();
    }
}