package com.example.SPT.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.SPT.entity.AssignmentSubmission;

@Repository
public interface AssignmentSubmissionRepository
        extends MongoRepository<AssignmentSubmission, String> {

    List<AssignmentSubmission> findByStudentId(String studentId);

    List<AssignmentSubmission> findByAssignmentId(String assignmentId);

    Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(String assignmentId, String studentId);

    long countByStudentIdAndStatus(String studentId, String status);
}