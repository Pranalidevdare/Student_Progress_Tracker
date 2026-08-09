package com.finalproject.studentprogresstracker.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SelectionStatusUpdateRequest {

    /*
     * Expected values:
     *
     * DOCUMENT_VERIFIED
     * DOCUMENT_VERIFICATION_FAILED
     */
    private String status;

    private String remarks;
}