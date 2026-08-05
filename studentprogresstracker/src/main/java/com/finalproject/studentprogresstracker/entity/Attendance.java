package com.finalproject.studentprogresstracker.entity;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "attendance")
public class Attendance {

    @Id
    private String attendanceId;

    private String trainerId;

    private String studentId;

    private String batchId;

    private LocalDate attendanceDate;

    private String status; // PRESENT, ABSENT, LEAVE
}