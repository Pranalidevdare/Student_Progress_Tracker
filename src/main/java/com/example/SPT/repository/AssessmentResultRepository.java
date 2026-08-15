package com.example.SPT.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.SPT.entity.AssessmentResult;

@Repository
public interface AssessmentResultRepository extends MongoRepository<AssessmentResult, String> {

    List<AssessmentResult> findByStudentId(String studentId);

    List<AssessmentResult> findByAssessmentId(String assessmentId);

    java.util.Optional<AssessmentResult> findByAssessmentIdAndStudentId(String assessmentId, String studentId);
    
    long countByStudentId(String studentId);
    long countByTrainerId(String trainerId);
}