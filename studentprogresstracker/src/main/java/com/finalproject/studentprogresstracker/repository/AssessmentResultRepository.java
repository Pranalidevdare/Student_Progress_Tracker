package com.finalproject.studentprogresstracker.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.finalproject.studentprogresstracker.entity.AssessmentResult;

@Repository
public interface AssessmentResultRepository extends MongoRepository<AssessmentResult, String> {

    List<AssessmentResult> findByStudentId(String studentId);

    List<AssessmentResult> findByAssessmentId(String assessmentId);
    
    long countByStudentId(String studentId);
    long countByTrainerId(String trainerId);
}