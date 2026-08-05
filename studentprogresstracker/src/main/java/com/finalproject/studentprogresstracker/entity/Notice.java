package com.finalproject.studentprogresstracker.entity;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "notices")
public class Notice {

    @Id
    private String noticeId;

    private String trainerId;

    private String title;

    private String description;

    private LocalDate noticeDate;
}