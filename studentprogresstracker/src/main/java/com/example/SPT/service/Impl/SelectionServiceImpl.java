package com.example.SPT.service.Impl;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.example.SPT.dto.request.SelectionStatusUpdateRequest;
import com.example.SPT.dto.response.StudentResponse;
import com.example.SPT.entity.SelectionStatus;
import com.example.SPT.entity.Student;
import com.example.SPT.mapper.StudentMapper;
import com.example.SPT.repository.StudentRepository;
import com.example.SPT.service.SelectionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SelectionServiceImpl implements SelectionService {

    private final StudentRepository studentRepository;

    private final StudentMapper studentMapper;

    @Override
    public StudentResponse updateDocumentVerification(
            String studentId,
            SelectionStatusUpdateRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Verification request cannot be null.");
        }

        if (request.getStatus() == null
                || request.getStatus().isBlank()) {

            throw new IllegalArgumentException(
                    "Verification status is required.");
        }

        Student student =
                studentRepository.findById(studentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student/Candidate not found with id : "
                                                + studentId));

        /*
         * Documents can be verified only after
         * aptitude, technical and soft-skill stages
         * have been successfully completed.
         */
        if (student.getSelectionStatus()
                != SelectionStatus.DOCUMENT_VERIFICATION_PENDING) {

            throw new IllegalStateException(
                    "Candidate is not ready for document verification. "
                            + "Current status: "
                            + student.getSelectionStatus());
        }

        String requestedStatus =
                request.getStatus()
                        .trim()
                        .toUpperCase();

        if ("DOCUMENT_VERIFIED".equals(requestedStatus)) {

            student.setSelectionStatus(
                    SelectionStatus.SELECTED);

        } else if ("DOCUMENT_VERIFICATION_FAILED"
                .equals(requestedStatus)) {

            student.setSelectionStatus(
                    SelectionStatus.REJECTED);

        } else {

            throw new IllegalArgumentException(
                    "Invalid document verification status. "
                            + "Allowed values are "
                            + "DOCUMENT_VERIFIED or "
                            + "DOCUMENT_VERIFICATION_FAILED.");
        }

        student.setUpdatedAt(LocalDateTime.now());

        Student updatedStudent =
                studentRepository.save(student);

        return studentMapper.toResponse(updatedStudent);
    }
}