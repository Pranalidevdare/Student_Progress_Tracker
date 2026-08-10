package com.example.SPT.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.SPT.dto.request.ApplicationStatusUpdateRequest;
import com.example.SPT.dto.request.ApplicationUpdateRequest;
import com.example.SPT.dto.response.ApplicationResponse;
import com.example.SPT.enums.ApplicationStatus;
import com.example.SPT.service.ApplicationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.example.SPT.dto.response.StudentResponse;
@RestController
@RequestMapping("/api/admin/applications")
@RequiredArgsConstructor
@Validated
@CrossOrigin(origins = "*")
public class AdminApplicationController {

    private final ApplicationService applicationService;

    // GET ALL APPLICATIONS

    @GetMapping("/getAll")
    public ResponseEntity<List<ApplicationResponse>> getAllApplications() {

        return ResponseEntity.ok(
                applicationService.getAllApplications()
        );
    }

    // GET APPLICATION BY ID

    @GetMapping("/getById/{id}")
    public ResponseEntity<ApplicationResponse> getApplicationById(
            @PathVariable String id) {

        return ResponseEntity.ok(
                applicationService.getApplicationById(id)
        );
    }

    // GET BY APPLICATION NUMBER

    @GetMapping("/getByApplicationNumber/{applicationNumber}")
    public ResponseEntity<ApplicationResponse>
            getApplicationByApplicationNumber(
                    @PathVariable String applicationNumber) {

        return ResponseEntity.ok(
                applicationService
                        .getApplicationByApplicationNumber(
                                applicationNumber
                        )
        );
    }

    // SEARCH BY NAME

    @GetMapping("/searchByName")
    public ResponseEntity<List<ApplicationResponse>> searchByName(
            @RequestParam String name) {

        return ResponseEntity.ok(
                applicationService.searchByName(name)
        );
    }

    // GET BY STATUS

    @GetMapping("/getByStatus/{status}")
    public ResponseEntity<List<ApplicationResponse>>
            getApplicationsByStatus(
                    @PathVariable ApplicationStatus status) {

        return ResponseEntity.ok(
                applicationService.getApplicationsByStatus(status)
        );
    }
    
    @GetMapping("/eligible-for-aptitude")
    public ResponseEntity<List<ApplicationResponse>>
    getEligibleForAptitude() {

        List<ApplicationResponse> applications =
                applicationService.getApplicationsByStatus(
                        ApplicationStatus.ELIGIBLE_FOR_APTITUDE);

        return ResponseEntity.ok(applications);
    }

    // UPDATE APPLICATION

    @PutMapping("/update/{id}")
    public ResponseEntity<ApplicationResponse> updateApplication(
            @PathVariable String id,
            @Valid @RequestBody ApplicationUpdateRequest request) {

        return ResponseEntity.ok(
                applicationService.updateApplication(
                        id,
                        request
                )
        );
    }

    // UPDATE APPLICATION STATUS

    @PatchMapping("/updateStatus/{id}")
    public ResponseEntity<ApplicationResponse>
            updateApplicationStatus(
                    @PathVariable String id,
                    @Valid @RequestBody
                    ApplicationStatusUpdateRequest request) {

        return ResponseEntity.ok(
                applicationService.updateApplicationStatus(
                        id,
                        request
                )
        );
    }

    // DELETE APPLICATION

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteApplication(
            @PathVariable String id) {

        applicationService.deleteApplication(id);

        return ResponseEntity.noContent().build();
    }
    
 // CREATE STUDENT FROM SELECTED APPLICATION

    @PostMapping("/{id}/create-student")
    public ResponseEntity<StudentResponse> createStudentFromSelectedApplication(
            @PathVariable String id) {

        StudentResponse response =
                applicationService
                        .createStudentFromSelectedApplication(id);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
    
    
}