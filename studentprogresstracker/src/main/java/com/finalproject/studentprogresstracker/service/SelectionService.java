package com.finalproject.studentprogresstracker.service;

import com.finalproject.studentprogresstracker.dto.request.SelectionStatusUpdateRequest;
import com.finalproject.studentprogresstracker.dto.response.StudentResponse;

public interface SelectionService {

    StudentResponse updateDocumentVerification(
            String studentId,
            SelectionStatusUpdateRequest request);
}