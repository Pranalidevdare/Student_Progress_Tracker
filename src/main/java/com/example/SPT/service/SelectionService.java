package com.example.SPT.service;

import com.example.SPT.dto.request.SelectionStatusUpdateRequest;
import com.example.SPT.dto.response.StudentResponse;

public interface SelectionService {

    StudentResponse updateDocumentVerification(
            String studentId,
            SelectionStatusUpdateRequest request);
}