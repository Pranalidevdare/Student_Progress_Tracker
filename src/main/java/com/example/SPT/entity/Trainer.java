package com.example.SPT.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "trainers")
public class Trainer {

    @Id
    private String id;

    // Personal Details
    private String firstName;
    private String lastName;
    private String email;
    private String mobile;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;
    private String gender;

    // Professional Details
    private String employeeId;
    private String specialization;
    private String qualification;
    private Integer experience;

    // Batch Details
    private String batchName;
    private String batchId;

    // Profile
    private String profileImage;

    // Account
    private String password;

    private Boolean active;

    // Audit Fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}