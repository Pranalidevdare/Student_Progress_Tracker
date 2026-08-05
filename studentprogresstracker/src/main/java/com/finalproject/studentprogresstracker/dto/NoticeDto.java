package com.finalproject.studentprogresstracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Notice DTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeDto {

    private String id;

    private String title;

    private String description;

    private LocalDate publishDate;
}