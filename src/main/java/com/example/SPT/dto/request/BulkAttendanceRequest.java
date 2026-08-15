package com.example.SPT.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkAttendanceRequest {

    @NotBlank(message = "Batch Id is required")
    private String batchId;

    @NotNull(message = "Attendance Date is required")
    private LocalDate attendanceDate;

    @Builder.Default
    private String sessionType = "TECHNICAL";

    @Builder.Default
    private String targetStatus = "PRESENT";
}
