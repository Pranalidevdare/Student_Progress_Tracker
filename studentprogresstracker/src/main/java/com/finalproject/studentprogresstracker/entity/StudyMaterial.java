package com.finalproject.studentprogresstracker.entity;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "study_material")
public class StudyMaterial {

    @Id
    private String materialId;

    private String trainerId;

    private String title;

    private String subject;

    private String description;

    private String fileUrl;

    private LocalDate uploadDate;
}