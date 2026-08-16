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
public class TrainerBatchSwitchRequest {

    @NotBlank(message = "Batch ID is required")
    private String batchId;
    
    private String batchName;
}
