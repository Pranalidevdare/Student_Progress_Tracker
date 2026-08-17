package com.example.SPT.service.Impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.SPT.dto.response.TopperResponse;
import com.example.SPT.entity.Batch;
import com.example.SPT.entity.Performance;
import com.example.SPT.repository.BatchRepository;
import com.example.SPT.repository.PerformanceRepository;
import com.example.SPT.service.TopperService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TopperServiceImpl implements TopperService {

    private final PerformanceRepository performanceRepository;
    private final BatchRepository batchRepository;

    @Override
    public List<TopperResponse> getAllToppers() {
        return performanceRepository.findAllByOrderByRankAsc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TopperResponse> getToppersByBatch(String batchId) {
        if (batchId == null || batchId.isBlank()) {
            batchId = "BATCH001";
        }
        String cleanBatchId = batchId.trim();

        // Direct query
        List<Performance> performances = new ArrayList<>(performanceRepository.findByBatchIdOrderByRankAsc(cleanBatchId));

        // Fallback multi-format batch resolution (ObjectId vs string name)
        if (performances.isEmpty()) {
            Optional<Batch> batchOpt = batchRepository.findById(cleanBatchId);
            if (!batchOpt.isPresent()) {
                batchOpt = batchRepository.findByBatchName(cleanBatchId);
            }
            String resolvedBatchName = batchOpt.isPresent() ? batchOpt.get().getBatchName() : null;
            String resolvedBatchId = batchOpt.isPresent() ? batchOpt.get().getId() : null;

            List<Performance> all = performanceRepository.findAllByOrderByOverallPercentageDesc();
            for (Performance p : all) {
                if (p.getBatchId() != null) {
                    if (p.getBatchId().equalsIgnoreCase(cleanBatchId) ||
                        (resolvedBatchName != null && p.getBatchId().equalsIgnoreCase(resolvedBatchName)) ||
                        (resolvedBatchId != null && p.getBatchId().equalsIgnoreCase(resolvedBatchId))) {
                        performances.add(p);
                    }
                }
            }

            if (performances.isEmpty() && ("BATCH001".equalsIgnoreCase(cleanBatchId) || "BATCH001".equalsIgnoreCase(resolvedBatchName))) {
                performances.addAll(all);
            }
        }

        // Sort descending by overall percentage
        performances.sort((a, b) -> {
            Double p1 = a.getOverallPercentage() != null ? a.getOverallPercentage() : 0.0;
            Double p2 = b.getOverallPercentage() != null ? b.getOverallPercentage() : 0.0;
            return Double.compare(p2, p1);
        });

        // Competition rank calculation with tie handling (1, 1, 3...)
        int currentRank = 1;
        Double prevPercentage = null;
        for (int i = 0; i < performances.size(); i++) {
            Performance p = performances.get(i);
            if (p.getOverallPercentage() != null) {
                if (prevPercentage != null && p.getOverallPercentage().equals(prevPercentage)) {
                    p.setRank(currentRank);
                } else {
                    currentRank = i + 1;
                    p.setRank(currentRank);
                    prevPercentage = p.getOverallPercentage();
                }
            } else {
                p.setRank(i + 1);
            }
        }

        return performances.stream()
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