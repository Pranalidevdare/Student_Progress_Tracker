package com.example.SPT.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.SPT.dto.request.DocumentationSubmitRequest;
import com.example.SPT.dto.response.DocumentationResponse;
import com.example.SPT.enums.DocumentationStatus;
import com.example.SPT.service.DocumentationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Validated
public class DocumentationController {

    private final DocumentationService documentationService;


    // =========================================================
    // CANDIDATE
    // SUBMIT DOCUMENTATION
    // =========================================================

    @PostMapping(
            value = "/documentations/submit",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<DocumentationResponse> submitDocumentation(
            @Valid DocumentationSubmitRequest request) {

        DocumentationResponse response =
                documentationService.submitDocumentation(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================================================
    // GET DOCUMENTATION BY ID
    // =========================================================

    @GetMapping("/documentations/{id}")
    public ResponseEntity<DocumentationResponse>
            getDocumentationById(
                    @PathVariable String id) {

        return ResponseEntity.ok(
                documentationService
                        .getDocumentationById(id)
        );
    }


    // =========================================================
    // GET DOCUMENTATION BY APPLICATION ID
    // =========================================================

    @GetMapping("/documentations/application/{applicationId}")
    public ResponseEntity<DocumentationResponse>
            getDocumentationByApplicationId(
                    @PathVariable String applicationId) {

        return ResponseEntity.ok(
                documentationService
                        .getDocumentationByApplicationId(
                                applicationId
                        )
        );
    }


    // =========================================================
    // ADMIN
    // GET ALL DOCUMENTATIONS
    // =========================================================

    @GetMapping("/admin/documentations")
    public ResponseEntity<List<DocumentationResponse>>
            getAllDocumentations() {

        return ResponseEntity.ok(
                documentationService
                        .getAllDocumentations()
        );
    }


    // =========================================================
    // ADMIN
    // GET DOCUMENTATIONS BY STATUS
    // =========================================================

    @GetMapping("/admin/documentations/status/{status}")
    public ResponseEntity<List<DocumentationResponse>>
            getDocumentationsByStatus(
                    @PathVariable DocumentationStatus status) {

        return ResponseEntity.ok(
                documentationService
                        .getDocumentationsByStatus(status)
        );
    }


    // =========================================================
    // ADMIN
    // VERIFY DOCUMENTATION
    // =========================================================

    @PatchMapping("/admin/documentations/{id}/verify")
    public ResponseEntity<DocumentationResponse>
            verifyDocumentation(
                    @PathVariable String id,
                    @RequestParam(required = false)
                    String remarks) {

        return ResponseEntity.ok(
                documentationService
                        .verifyDocumentation(
                                id,
                                remarks
                        )
        );
    }


    // =========================================================
    // ADMIN
    // REJECT DOCUMENTATION
    // =========================================================

    @PatchMapping("/admin/documentations/{id}/reject")
    public ResponseEntity<DocumentationResponse>
            rejectDocumentation(
                    @PathVariable String id,
                    @RequestParam(required = false)
                    String remarks) {

        return ResponseEntity.ok(
                documentationService
                        .rejectDocumentation(
                                id,
                                remarks
                        )
        );
    }
}