package com.example.SPT.service.Impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.SPT.dto.request.ApplicationCreateRequest;
import com.example.SPT.dto.request.ApplicationStatusUpdateRequest;
import com.example.SPT.dto.request.ApplicationUpdateRequest;
import com.example.SPT.dto.response.ApplicationResponse;
import com.example.SPT.entity.Application;
import com.example.SPT.enums.ApplicationStatus;
import com.example.SPT.exception.ResourceAlreadyExistsException;
import com.example.SPT.exception.ResourceNotFoundException;
import com.example.SPT.repository.ApplicationRepository;
import com.example.SPT.service.ApplicationService;
import com.example.SPT.service.SequenceGeneratorService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    
    private static final String APPLICATION_SEQUENCE = "application_sequence";
    
    private final SequenceGeneratorService sequenceGeneratorService;
    
    private void validateApplication(ApplicationCreateRequest request) {

        if (applicationRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException(
                    "Application already exists with email : " + request.getEmail());
        }

        if (applicationRepository.existsByMobile(request.getMobile())) {
            throw new ResourceAlreadyExistsException(
                    "Application already exists with mobile number : " + request.getMobile());
        }
    }

    
    private Application mapToEntity(ApplicationCreateRequest request) {

        return Application.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .mobile(request.getMobile())
                .fatherOccupation(request.getFatherOccupation())
                .fatherContactNumber(request.getFatherContactNumber())
                .motherOccupation(request.getMotherOccupation())
                .motherContactNumber(request.getMotherContactNumber())
                .familyIncome(request.getFamilyIncome())
                .branch(request.getBranch())
                .yearOfStudy(request.getYearOfStudy())
                .collegeName(request.getCollegeName())
                .interestedInITEP(request.getInterestedInITEP())
                .joinedWhatsappGroup(request.getJoinedWhatsappGroup())
                .additionalComments(request.getAdditionalComments())
                .build();
    }
    
    private ApplicationResponse mapToResponse(Application application) {

        return ApplicationResponse.builder()
                .id(application.getId())
                .applicationNumber(application.getApplicationNumber())
                .status(application.getStatus())
                .fullName(application.getFullName())
                .email(application.getEmail())
                .mobile(application.getMobile())
                .collegeName(application.getCollegeName())
                .branch(application.getBranch())
                .yearOfStudy(application.getYearOfStudy())
                .familyIncome(application.getFamilyIncome())
                .interestedInITEP(application.getInterestedInITEP())
                .joinedWhatsappGroup(application.getJoinedWhatsappGroup())
                .adminRemarks(application.getAdminRemarks())
                .createdAt(application.getCreatedAt())
                .build();
    }
    
    @Override
    public ApplicationResponse submitApplication(ApplicationCreateRequest request) {

        validateApplication(request);

        Application application = mapToEntity(request);

        long sequence = sequenceGeneratorService
                .generateSequence(APPLICATION_SEQUENCE);

        application.setApplicationNumber(
                String.format("APP-%d-%06d",
                        LocalDate.now().getYear(),
                        sequence));
        application.setStatus(ApplicationStatus.SUBMITTED);
        application.setActive(true);
        application.setCreatedAt(LocalDateTime.now());
        application.setUpdatedAt(LocalDateTime.now());

        Application savedApplication = applicationRepository.save(application);

        return mapToResponse(savedApplication);
    }
    
    @Override
    public List<ApplicationResponse> getAllApplications() {

        return applicationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    
    @Override
    public ApplicationResponse getApplicationById(String id) {

        Application application = applicationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Application not found with id : " + id));

        return mapToResponse(application);
    }
    
    @Override
    public ApplicationResponse getApplicationByApplicationNumber(
            String applicationNumber) {

        Application application = applicationRepository
                .findByApplicationNumber(applicationNumber)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Application not found with application number : "
                                        + applicationNumber));

        return mapToResponse(application);
    }
    
    @Override
    public List<ApplicationResponse> searchByName(String name) {

        return applicationRepository
                .findByFullNameContainingIgnoreCase(name)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    
    @Override
    public List<ApplicationResponse> getApplicationsByStatus(
            ApplicationStatus status) {

        return applicationRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    
    
    @Override
    public ApplicationResponse updateApplication(
            String id,
            ApplicationUpdateRequest request) {

        Application application = getApplication(id);

        application.setFullName(request.getFullName());

        application.setFatherOccupation(
                request.getFatherOccupation());

        application.setFatherContactNumber(
                request.getFatherContactNumber());

        application.setMotherOccupation(
                request.getMotherOccupation());

        application.setMotherContactNumber(
                request.getMotherContactNumber());

        application.setFamilyIncome(
                request.getFamilyIncome());

        application.setBranch(
                request.getBranch());

        application.setYearOfStudy(
                request.getYearOfStudy());

        application.setCollegeName(
                request.getCollegeName());

        application.setInterestedInITEP(
                request.getInterestedInITEP());

        application.setJoinedWhatsappGroup(
                request.getJoinedWhatsappGroup());

        application.setAdditionalComments(
                request.getAdditionalComments());

        application.setUpdatedAt(LocalDateTime.now());

        Application updatedApplication =
                applicationRepository.save(application);

        return mapToResponse(updatedApplication);
    }
    
    @Override
    public void deleteApplication(String id) {

        Application application = getApplication(id);

        application.setActive(false);
        application.setUpdatedAt(LocalDateTime.now());

        applicationRepository.save(application);
    }
    
    @Override
    public ApplicationResponse updateApplicationStatus(
            String id,
            ApplicationStatusUpdateRequest request) {

        Application application = getApplication(id);

        application.setStatus(request.getStatus());

        if (request.getRemarks() != null
                && !request.getRemarks().trim().isEmpty()) {

            application.setAdminRemarks(
                    request.getRemarks().trim());
        }

        application.setUpdatedAt(LocalDateTime.now());

        Application updatedApplication =
                applicationRepository.save(application);

        return mapToResponse(updatedApplication);
    }
    
    private Application getApplication(String id) {

        return applicationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Application not found with id : " + id));
    }

}