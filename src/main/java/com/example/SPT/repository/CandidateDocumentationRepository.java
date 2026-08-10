package com.example.SPT.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.SPT.entity.CandidateDocumentation;
import com.example.SPT.enums.DocumentationStatus;

@Repository
public interface CandidateDocumentationRepository
        extends MongoRepository<CandidateDocumentation, String> {

    // Find documentation using application ID
    Optional<CandidateDocumentation> findByApplicationId(
            String applicationId);

    // Check whether documentation already exists
    boolean existsByApplicationId(
            String applicationId);

    // Find documentation using application number
    Optional<CandidateDocumentation> findByApplicationNumber(
            String applicationNumber);

    // Get all documentation by status
    List<CandidateDocumentation> findByStatus(
            DocumentationStatus status);

    // Get active documentation
    List<CandidateDocumentation> findByActiveTrue();

    // Get active documentation by status
    List<CandidateDocumentation> findByStatusAndActiveTrue(
            DocumentationStatus status);
}