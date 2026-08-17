package com.example.SPT.service;

import java.util.List;

import org.springframework.core.io.Resource;

import com.example.SPT.dto.request.DocumentationSubmitRequest;
import com.example.SPT.dto.response.DocumentationResponse;
import com.example.SPT.enums.DocumentationStatus;

public interface DocumentationService {

    record DocumentFileContent(
            String fileName,
            String contentType,
            Resource resource
    ) {}

    // Candidate submits documentation
    DocumentationResponse submitDocumentation(
            DocumentationSubmitRequest request);

    // Get documentation by documentation ID
    DocumentationResponse getDocumentationById(
            String id);

    // Get documentation by application ID
    DocumentationResponse getDocumentationByApplicationId(
            String applicationId);

    // Get all documentation records
    List<DocumentationResponse> getAllDocumentations();

    // Get documentation by status
    List<DocumentationResponse> getDocumentationsByStatus(
            DocumentationStatus status);

    // Admin verifies documentation
    DocumentationResponse verifyDocumentation(
            String id,
            String remarks);

    // Admin rejects documentation
    DocumentationResponse rejectDocumentation(
            String id,
            String remarks);

    // Retrieve a single uploaded document file for preview/download
    DocumentFileContent getDocumentFile(
            String applicationId,
            String documentType);
}