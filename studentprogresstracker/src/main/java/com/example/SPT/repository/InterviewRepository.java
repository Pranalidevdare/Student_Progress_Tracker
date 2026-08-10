package com.example.SPT.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.SPT.entity.Interview;

@Repository
public interface InterviewRepository
        extends MongoRepository<Interview, String> {

    // Get all interviews of a student
    List<Interview> findByStudentId(String studentId);

    // Get a specific interview type of a student
    Optional<Interview> findByStudentIdAndInterviewType(
            String studentId,
            String interviewType);

    // Trainer dashboard
    long countByTrainerId(String trainerId);

    // Count interviews by type
    long countByInterviewType(String interviewType);

    // Count interviews conducted by trainer and type
    long countByTrainerIdAndInterviewType(
            String trainerId,
            String interviewType);
    
    Optional<Interview> findTopByStudentIdOrderByUpdatedAtDesc(
            String studentId);

}