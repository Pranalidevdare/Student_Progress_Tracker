package com.finalproject.studentprogresstracker.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyMaterialResponse {

    private String materialId;

    private String trainerId;

    private String title;

    private String subject;

    private String description;

    private String fileUrl;

    private LocalDate uploadDate;

}