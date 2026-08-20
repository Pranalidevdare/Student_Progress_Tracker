package com.example.SPT.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.SPT.entity.AptitudeResult;

@Repository
public interface AptitudeResultRepository
        extends MongoRepository<AptitudeResult, String> {

    // Get the latest aptitude result of a candidate
    Optional<AptitudeResult> findTopByCandidateIdOrderByCreatedAtDesc(
            String candidateId);

    // Get all aptitude attempts of a candidate
    List<AptitudeResult> findByCandidateIdOrderByCreatedAtDesc(
            String candidateId);

    // Check whether candidate has already attempted an assessment
    boolean existsByCandidateIdAndAssessmentId(
            String candidateId,
            String assessmentId);

    // Get result for a particular candidate and assessment
    Optional<AptitudeResult> findByCandidateIdAndAssessmentId(
            String candidateId,
            String assessmentId);

    // Get all results of a particular assessment
    List<AptitudeResult> findByAssessmentId(
            String assessmentId);

    // Get results by status
    List<AptitudeResult> findByStatus(
            String status);

    // Get all passed candidates
    List<AptitudeResult> findByStatusOrderByPercentageDesc(
            String status);

    // Get current in-progress aptitude attempt
    Optional<AptitudeResult> findTopByCandidateIdAndStatusOrderByCreatedAtDesc(
            String candidateId,
            String status);

    // Get latest attempt by candidate IDs and statuses
    Optional<AptitudeResult> findTopByCandidateIdInAndStatusInOrderByCreatedAtDesc(
            List<String> candidateIds,
            List<String> statuses);

    // Get latest attempt across candidate IDs
    Optional<AptitudeResult> findTopByCandidateIdInOrderByCreatedAtDesc(
            List<String> candidateIds);

    // Get latest attempt by candidate IDs and specific status
    Optional<AptitudeResult> findTopByCandidateIdInAndStatusOrderByCreatedAtDesc(
            List<String> candidateIds,
            String status);
}