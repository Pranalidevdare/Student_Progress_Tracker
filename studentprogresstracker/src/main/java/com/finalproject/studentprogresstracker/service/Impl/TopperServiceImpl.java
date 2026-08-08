package com.finalproject.studentprogresstracker.service.Impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.finalproject.studentprogresstracker.dto.response.TopperResponse;
import com.finalproject.studentprogresstracker.entity.Performance;
import com.finalproject.studentprogresstracker.repository.PerformanceRepository;
import com.finalproject.studentprogresstracker.service.TopperService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TopperServiceImpl implements TopperService {

    private final PerformanceRepository performanceRepository;

    @Override
    public List<TopperResponse> getAllToppers() {

        return performanceRepository.findAllByOrderByRankAsc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TopperResponse> getToppersByBatch(String batchId) {

        return performanceRepository.findByBatchIdOrderByRankAsc(batchId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TopperResponse> getTopRankers(int limit) {

        return performanceRepository.findAllByOrderByRankAsc()
                .stream()
                .limit(limit)
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private TopperResponse convertToResponse(Performance performance) {

    	return TopperResponse.builder()
    	        .rank(performance.getRank())
    	        .studentId(performance.getStudentId())
    	        .studentName(performance.getStudentName())
    	        .batchId(performance.getBatchId())
    	        .overallPercentage(performance.getOverallPercentage())
    	        .performanceStatus(
    	                performance.getPerformanceStatus() != null
    	                        ? performance.getPerformanceStatus().name()
    	                        : null)
    	        .build();
    }
}