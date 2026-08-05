package com.finalproject.studentprogresstracker.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.finalproject.studentprogresstracker.entity.Performance;
import com.finalproject.studentprogresstracker.repository.PerformanceRepository;

@Service
public class PerformanceService {

    @Autowired
    private PerformanceRepository performanceRepository;

    // Add Performance
    public Performance addPerformance(Performance performance) {

        return performanceRepository.save(performance);
    }

    // Get All Performance
    public List<Performance> getAllPerformance() {

        return performanceRepository.findAll();
    }

    // Get Performance By Id
    public Performance getPerformanceById(String performanceId) {

        return performanceRepository.findById(performanceId)
                .orElseThrow(() ->
                        new RuntimeException("Performance Record Not Found"));
    }

    // Get Performance By Student
    public List<Performance> getPerformanceByStudent(String studentId) {

        return performanceRepository.findByStudentId(studentId);
    }

    // Get Performance By Trainer
    public List<Performance> getPerformanceByTrainer(String trainerId) {

        return performanceRepository.findByTrainerId(trainerId);
    }

    // Update Performance
    public Performance updatePerformance(String performanceId,
                                         Performance performance) {

        Performance existingPerformance =
                performanceRepository.findById(performanceId)
                        .orElseThrow(() ->
                                new RuntimeException("Performance Record Not Found"));

        existingPerformance.setTrainerId(performance.getTrainerId());
        existingPerformance.setStudentId(performance.getStudentId());
        existingPerformance.setAttendancePercentage(
                performance.getAttendancePercentage());
        existingPerformance.setAssignmentMarks(
                performance.getAssignmentMarks());
        existingPerformance.setTestMarks(
                performance.getTestMarks());
        existingPerformance.setOverallPerformance(
                performance.getOverallPerformance());
        existingPerformance.setRemarks(
                performance.getRemarks());

        return performanceRepository.save(existingPerformance);
    }

    // Delete Performance
    public String deletePerformance(String performanceId) {

        Performance performance =
                performanceRepository.findById(performanceId)
                        .orElseThrow(() ->
                                new RuntimeException("Performance Record Not Found"));

        performanceRepository.delete(performance);

        return "Performance Deleted Successfully";
    }

}