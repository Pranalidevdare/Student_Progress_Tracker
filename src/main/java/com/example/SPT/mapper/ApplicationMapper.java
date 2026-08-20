package com.example.SPT.mapper;

import org.springframework.stereotype.Component;

import com.example.SPT.dto.response.ApplicationResponse;
import com.example.SPT.entity.Application;

@Component
public class ApplicationMapper {

    public ApplicationResponse toResponse(Application application) {
        if (application == null) {
            return null;
        }

        return ApplicationResponse.builder()
                .id(application.getId())
                .applicationNumber(application.getApplicationNumber())
                .fullName(application.getFullName())
                .email(application.getEmail())
                .mobile(application.getMobile())
                .collegeName(application.getCollegeName())
                .branch(application.getBranch())
                .yearOfStudy(application.getYearOfStudy())
                .familyIncome(application.getFamilyIncome())
                .interestedInITEP(application.getInterestedInITEP())
                .joinedWhatsappGroup(application.getJoinedWhatsappGroup())
                .status(application.getStatus())
                .adminRemarks(application.getAdminRemarks())
                .technicalInterviewRemarks(application.getTechnicalInterviewRemarks())
                .hrInterviewRemarks(application.getHrInterviewRemarks())
                .assignedBatchId(application.getAssignedBatchId())
                .assignedBatchName(application.getAssignedBatchName())
                .createdAt(application.getCreatedAt())
                .build();
    }
}
