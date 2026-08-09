package com.finalproject.studentprogresstracker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finalproject.studentprogresstracker.dto.request.SelectionStatusUpdateRequest;
import com.finalproject.studentprogresstracker.dto.response.StudentResponse;
import com.finalproject.studentprogresstracker.service.SelectionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/selection")
@RequiredArgsConstructor
public class SelectionController {

    private final SelectionService selectionService;

    /**
     * Admin/verification process updates document verification.
     *
     * Allowed status values:
     *
     * DOCUMENT_VERIFIED
     * DOCUMENT_VERIFICATION_FAILED
     */
    @PostMapping("/{studentId}/document-verification")
    public ResponseEntity<StudentResponse> updateDocumentVerification(
            @PathVariable String studentId,
            @RequestBody SelectionStatusUpdateRequest request) {

        StudentResponse response =
                selectionService.updateDocumentVerification(
                        studentId,
                        request);

        return ResponseEntity.ok(response);
    }
}