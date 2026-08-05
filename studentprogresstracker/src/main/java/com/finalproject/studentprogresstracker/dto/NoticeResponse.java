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
public class NoticeResponse {

    private String noticeId;

    private String trainerId;

    private String title;

    private String description;

    private LocalDate noticeDate;

}