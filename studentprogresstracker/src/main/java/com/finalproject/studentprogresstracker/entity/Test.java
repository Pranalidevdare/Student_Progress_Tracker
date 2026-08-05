package com.finalproject.studentprogresstracker.entity;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "tests")
public class Test {

    @Id
    private String testId;

    private String trainerId;

    private String batchId;

    private String testTitle;

    private LocalDate testDate;

    private int duration;

    private int totalMarks;
}