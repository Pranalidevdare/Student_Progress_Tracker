package com.finalproject.studentprogresstracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Study Material DTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyMaterialDto {

    private String id;

    private String title;

    private String subject;

    private String fileName;

    private String downloadUrl;
}