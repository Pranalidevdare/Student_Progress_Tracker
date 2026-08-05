package com.finalproject.studentprogresstracker.entity;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "assignments")
public class Assignment {

    @Id
    private String assignmentId;

    private String trainerId;

    private String batchId;

    private String title;

    private String description;

    private LocalDate assignedDate;

    private LocalDate dueDate;

    private String status;
}