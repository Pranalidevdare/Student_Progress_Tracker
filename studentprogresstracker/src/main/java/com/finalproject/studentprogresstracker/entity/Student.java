package com.finalproject.studentprogresstracker.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Entity representing a student profile in the
 * Training Institute Management System (TIMS).
 *
 * Authentication-related information such as password,
 * roles, JWT tokens, etc. are handled in a separate module.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "students")
public class Student {

    /**
     * MongoDB ObjectId
     */
    @Id
    private String id;

    /**
     * Student ID assigned by institute.
     * Example: STU001
     */
    @NotBlank(message = "Student ID is required")
    private String studentId;

    /**
     * Student Full Name
     */
    @NotBlank(message = "Name is required")
    private String name;

    /**
     * Email received from Authentication Module.
     * Non-editable.
     */
    @NotBlank(message = "Email is required")
    private String email;

    /**
     * Batch Name
     * Example:
     * Java Full Stack - Batch A
     */
    @NotBlank(message = "Batch is required")
    private String batch;

    /**
     * Phone Number
     * Editable by student.
     */
    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Phone number must be a valid 10-digit Indian mobile number"
    )
    private String phone;

    /**
     * Student Address
     */
    private String address;

    /**
     * Profile Picture URL or File Path
     */
    private String profilePicture;

    /**
     * Indicates whether the student profile is active.
     */
    @Builder.Default
    private Boolean active = true;
}