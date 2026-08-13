package com.example.SPT.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.SPT.dto.request.ApplicationCreateRequest;
import com.example.SPT.dto.response.ApplicationResponse;
import com.example.SPT.service.ApplicationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Validated
@CrossOrigin(origins = "*")
public class ApplicationRegistrationController {

    private final ApplicationService applicationService;

        // Public: Get application by application number (used by selection status page)
        @GetMapping("/getByApplicationNumber/{applicationNumber}")
        public ResponseEntity<ApplicationResponse> getByApplicationNumber(
                        @PathVariable String applicationNumber) {

                ApplicationResponse response =
                                applicationService.getApplicationByApplicationNumber(applicationNumber);

                return ResponseEntity.ok(response);
        }

    @PostMapping("/submit")
    public ResponseEntity<ApplicationResponse> submitApplication(
            @Valid @RequestBody ApplicationCreateRequest request) {

        ApplicationResponse response =
                applicationService.submitApplication(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}