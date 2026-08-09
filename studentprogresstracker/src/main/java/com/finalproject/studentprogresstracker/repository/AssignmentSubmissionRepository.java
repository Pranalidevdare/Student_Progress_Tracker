package com.finalproject.studentprogresstracker.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.finalproject.studentprogresstracker.entity.AssignmentSubmission;

@Repository
public interface AssignmentSubmissionRepository
        extends MongoRepository<AssignmentSubmission, String> {

    List<AssignmentSubmission> findByStudentId(String studentId);

    List<AssignmentSubmission> findByAssignmentId(String assignmentId);

    long countByStudentIdAndStatus(String studentId, String status);
}