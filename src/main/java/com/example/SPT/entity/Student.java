package com.example.SPT.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.example.SPT.enums.ApplicationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "students")
public class Student {

    @Id
    private String id;

    // Personal Details
    private String firstName;
    private String lastName;
    private String email;
    private String mobile;
    private LocalDate dateOfBirth;
    private String gender;

    // Academic Details
    private String collegeName;
    private String degree;
    private String branch;
    private Integer passingYear;
    private Double cgpa;

    // Batch Information
    private String batchName;
    private String batchId;

    // Profile
    private String profileImage;

    // Account
    private String password;

    private Boolean active;
    
    private ApplicationStatus applicationStatus;

    // Audit Fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}