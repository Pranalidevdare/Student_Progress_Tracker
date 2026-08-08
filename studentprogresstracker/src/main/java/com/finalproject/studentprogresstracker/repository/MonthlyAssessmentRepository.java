package com.finalproject.studentprogresstracker.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.finalproject.studentprogresstracker.entity.MonthlyAssessment;

@Repository
public interface MonthlyAssessmentRepository extends MongoRepository<MonthlyAssessment, String> {

    List<MonthlyAssessment> findByBatchId(String batchId);

    List<MonthlyAssessment> findByTrainerId(String trainerId);

}