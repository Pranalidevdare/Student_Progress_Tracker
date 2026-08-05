package com.finalproject.studentprogresstracker.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeRequest {

    @NotBlank(message = "Trainer ID is required")
    private String trainerId;

    @NotBlank(message = "Notice title is required")
    private String title;

    @NotBlank(message = "Notice description is required")
    private String description;

}