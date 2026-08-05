package com.finalproject.studentprogresstracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Dashboard response DTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponseDto {

    private String studentName;

    private String email;

    private String batch;

    private Double attendancePercentage;

    private Long pendingAssignmentsCount;

    private Long upcomingTestsCount;

    private List<NoticeDto> latestNotices;

    private List<StudyMaterialDto> latestStudyMaterials;

    private PerformanceSummaryDto performanceSummary;
}