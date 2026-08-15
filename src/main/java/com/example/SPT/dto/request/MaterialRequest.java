package com.example.SPT.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaterialRequest {

    private String trainerId;

    private String batchId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Subject is required")
    private String subject;

    private String materialType;

    private String fileName;

    private String fileUrl;

    private Long fileSize;

    private String contentType;

}