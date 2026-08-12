package com.example.SPT.service;

import java.util.List;

import com.example.SPT.dto.request.ApplicationCreateRequest;
import com.example.SPT.dto.request.ApplicationStatusUpdateRequest;
import com.example.SPT.dto.request.ApplicationUpdateRequest;
import com.example.SPT.dto.response.ApplicationResponse;
import com.example.SPT.dto.response.StudentResponse;
import com.example.SPT.enums.ApplicationStatus;

public interface ApplicationService {

    ApplicationResponse submitApplication(ApplicationCreateRequest  request);

    List<ApplicationResponse> getAllApplications();

    ApplicationResponse getApplicationById(String id);

    ApplicationResponse getApplicationByApplicationNumber(String applicationNumber);

    ApplicationResponse updateApplication(String id, ApplicationUpdateRequest  request);

    
    void deleteApplication(String id);

    
    ApplicationResponse updateApplicationStatus(String id,
    		ApplicationStatusUpdateRequest  status);

    
    List<ApplicationResponse> searchByName(String name);

    
    List<ApplicationResponse> getApplicationsByStatus(
            ApplicationStatus status);

    StudentResponse createStudentFromSelectedApplication(String applicationId);
}