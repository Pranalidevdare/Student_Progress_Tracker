package com.example.SPT.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.SPT.entity.MonthlyAssessment;

@Repository
public interface MonthlyAssessmentRepository extends MongoRepository<MonthlyAssessment, String> {

    List<MonthlyAssessment> findByBatchId(String batchId);

    List<MonthlyAssessment> findByTrainerId(String trainerId);

    List<MonthlyAssessment> findByBatchIdAndAssessmentDateBetween(String batchId, java.time.LocalDate startDate, java.time.LocalDate endDate);

}