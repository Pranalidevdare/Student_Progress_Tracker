package com.example.SPT.dto.response;

import java.time.LocalDateTime;

import com.example.SPT.enums.ApplicationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {

    // Application Details

    private String id;

    private String applicationNumber;

    private ApplicationStatus status;

    // Candidate Details

    private String fullName;

    private String email;

    private String mobile;

    // Academic Details

    private String collegeName;

    private String branch;

    private String yearOfStudy;

    private Double familyIncome;

    // Program Details

    private Boolean interestedInITEP;

    private Boolean joinedWhatsappGroup;

    // Admin Information

    private String adminRemarks;

    // Audit

    private LocalDateTime createdAt;

}