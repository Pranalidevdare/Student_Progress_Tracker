package com.example.SPT.service.Impl;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.example.SPT.dto.request.DocumentationSubmitRequest;
import com.example.SPT.dto.response.DocumentationResponse;
import com.example.SPT.entity.Application;
import com.example.SPT.entity.CandidateDocumentation;
import com.example.SPT.enums.ApplicationStatus;
import com.example.SPT.enums.DocumentationStatus;
import com.example.SPT.exception.ResourceAlreadyExistsException;
import com.example.SPT.exception.ResourceNotFoundException;
import com.example.SPT.repository.ApplicationRepository;
import com.example.SPT.repository.CandidateDocumentationRepository;
import com.example.SPT.service.DocumentationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DocumentationServiceImpl implements DocumentationService {

    private final CandidateDocumentationRepository documentationRepository;

    private final ApplicationRepository applicationRepository;

    /*
     * Base directory where uploaded documents will be stored.
     *
     * Can be configured in application.properties.
     */
    @Value("${app.file.upload-dir:uploads}")
    private String uploadDirectory;


    // =========================================================
    // SUBMIT DOCUMENTATION
    // =========================================================

//     @Override
//     public DocumentationResponse submitDocumentation(
//             DocumentationSubmitRequest request) {

//         if (request == null) {
//             throw new IllegalArgumentException(
//                     "Documentation request cannot be null");
//         }

//         // -----------------------------------------------------
//         // 1. Find application
//         // -----------------------------------------------------

//         Application application =
//                 applicationRepository
//                         .findById(request.getApplicationId())
//                         .or(() -> applicationRepository.findByApplicationNumber(request.getApplicationId()))
//                         .orElseThrow(() ->
//                                 new ResourceNotFoundException(
//                                         "Application not found with id or application number: "
//                                                 + request.getApplicationId()));


//         // -----------------------------------------------------
//         // 2. Check application status
//         // -----------------------------------------------------

//         /*
//          * Documentation should be submitted only after
//          * the candidate passes the aptitude test.
//          * Legacy or rejected submissions are also allowed to retry.
//          */
//         ApplicationStatus currentStatus = application.getStatus();
//         if (currentStatus != ApplicationStatus.APTITUDE_PASSED
//                 && currentStatus != ApplicationStatus.DOCUMENTATION_PENDING
//                 && currentStatus != ApplicationStatus.DOCUMENTS_REJECTED) {

//             throw new IllegalStateException(
//                     "Documentation cannot be submitted. "
//                     + "Current application status is: "
//                     + currentStatus);
//         }


//         // -----------------------------------------------------
//         // 3. Prevent duplicate documentation
//         // -----------------------------------------------------

//         if (documentationRepository
//                 .existsByApplicationId(
//                         request.getApplicationId())) {

//             throw new ResourceAlreadyExistsException(
//                     "Documentation already exists for application: "
//                             + request.getApplicationId());
//         }


//         // -----------------------------------------------------
//         // 4. Validate declaration
//         // -----------------------------------------------------

//         if (!Boolean.TRUE.equals(
//                 request.getDeclarationAccepted())) {

//             throw new IllegalArgumentException(
//                     "Candidate must accept the declaration");
//         }


//         // -----------------------------------------------------
//         // 5. Validate uploaded files
//         // -----------------------------------------------------

//         validateRequiredFile(
//                 request.getPassportPhoto(),
//                 "Passport photograph");

//         validateRequiredFile(
//                 request.getAadharDocument(),
//                 "Aadhar document");

//         validateRequiredFile(
//                 request.getTenthMarksheet(),
//                 "10th marksheet");

//         validateRequiredFile(
//                 request.getTwelfthMarksheet(),
//                 "12th marksheet");

//         validateRequiredFile(
//                 request.getBachelorMarksheet(),
//                 "Bachelor marksheet");

//         validateRequiredFile(
//                 request.getFamilyIncomeCertificate(),
//                 "Family income certificate");


//         // -----------------------------------------------------
//         // 6. Create candidate directory
//         // -----------------------------------------------------

//         String applicationNumber =
//                 application.getApplicationNumber();

//         String safeApplicationNumber =
//                 sanitizePathPart(applicationNumber);

//         Path candidateDirectory =
//                 Paths.get(
//                         uploadDirectory,
//                         "documentation",
//                         safeApplicationNumber);


//         try {

//             Files.createDirectories(candidateDirectory);

//         } catch (IOException exception) {

//             throw new RuntimeException(
//                     "Unable to create document storage directory",
//                     exception);
//         }


//         // -----------------------------------------------------
//         // 7. Store uploaded files
//         // -----------------------------------------------------

//         String passportPhoto =
//                 storeFile(
//                         request.getPassportPhoto(),
//                         candidateDirectory,
//                         "passport-photo");

//         String aadharDocument =
//                 storeFile(
//                         request.getAadharDocument(),
//                         candidateDirectory,
//                         "aadhar");

//         String tenthMarksheet =
//                 storeFile(
//                         request.getTenthMarksheet(),
//                         candidateDirectory,
//                         "10th-marksheet");

//         String twelfthMarksheet =
//                 storeFile(
//                         request.getTwelfthMarksheet(),
//                         candidateDirectory,
//                         "12th-marksheet");

//         String bachelorMarksheet =
//                 storeFile(
//                         request.getBachelorMarksheet(),
//                         candidateDirectory,
//                         "bachelor-marksheet");

//         String masterMarksheet = null;

//         if (request.getMasterMarksheet() != null
//                 && !request.getMasterMarksheet().isEmpty()) {

//             masterMarksheet =
//                     storeFile(
//                             request.getMasterMarksheet(),
//                             candidateDirectory,
//                             "master-marksheet");
//         }

//         String familyIncomeCertificate =
//                 storeFile(
//                         request.getFamilyIncomeCertificate(),
//                         candidateDirectory,
//                         "family-income-certificate");


//         // -----------------------------------------------------
//         // 8. Create CandidateDocumentation
//         // -----------------------------------------------------

//         LocalDateTime now =
//                 LocalDateTime.now();

//         CandidateDocumentation documentation =
//                 CandidateDocumentation.builder()

//                         .applicationId(
//                                 application.getId())

//                         .applicationNumber(
//                                 application.getApplicationNumber())

//                         // Personal details
//                         .candidateName(
//                                 request.getCandidateName())

//                         .dateOfBirth(
//                                 request.getDateOfBirth())

//                         .age(
//                                 request.getAge())

//                         .gender(
//                                 request.getGender())

//                         .otherGender(
//                                 request.getOtherGender())

//                         .fatherName(
//                                 request.getFatherName())

//                         .fatherOccupation(
//                                 request.getFatherOccupation())

//                         .motherName(
//                                 request.getMotherName())

//                         .motherOccupation(
//                                 request.getMotherOccupation())

//                         .firstGraduate(
//                                 request.getFirstGraduate())

//                         .maritalStatus(
//                                 request.getMaritalStatus())

//                         // Mailing address
//                         .mailingFullName(
//                                 request.getMailingFullName())

//                         .mailingAddress(
//                                 request.getMailingAddress())

//                         .mailingPincode(
//                                 request.getMailingPincode())

//                         .personalMobile(
//                                 request.getPersonalMobile())

//                         .personalEmail(
//                                 request.getPersonalEmail())

//                         // Guardian
//                         .guardianFullName(
//                                 request.getGuardianFullName())

//                         .guardianAddress(
//                                 request.getGuardianAddress())

//                         .guardianPincode(
//                                 request.getGuardianPincode())

//                         .guardianMobile(
//                                 request.getGuardianMobile())

//                         .guardianLandline(
//                                 request.getGuardianLandline())

//                         // 10th
//                         .tenthSchoolName(
//                                 request.getTenthSchoolName())

//                         .tenthBoard(
//                                 request.getTenthBoard())

//                         .tenthPassingYear(
//                                 request.getTenthPassingYear())

//                         .tenthMarks(
//                                 request.getTenthMarks())

//                         .tenthPercentage(
//                                 request.getTenthPercentage())

//                         // 12th
//                         .twelfthSchoolName(
//                                 request.getTwelfthSchoolName())

//                         .twelfthBoard(
//                                 request.getTwelfthBoard())

//                         .twelfthPassingYear(
//                                 request.getTwelfthPassingYear())

//                         .twelfthMarks(
//                                 request.getTwelfthMarks())

//                         .twelfthPercentage(
//                                 request.getTwelfthPercentage())

//                         // Graduation
//                         .graduationCollege(
//                                 request.getGraduationCollege())

//                         .graduationDegree(
//                                 request.getGraduationDegree())

//                         .graduationMarks(
//                                 request.getGraduationMarks())

//                         .graduationPercentage(
//                                 request.getGraduationPercentage())

//                         .graduationPassingYear(
//                                 request.getGraduationPassingYear())

//                         // Post graduation
//                         .postGraduationCollege(
//                                 request.getPostGraduationCollege())

//                         .postGraduationDegree(
//                                 request.getPostGraduationDegree())

//                         .postGraduationPassingYear(
//                                 request.getPostGraduationPassingYear())

//                         .postGraduationMarks(
//                                 request.getPostGraduationMarks())

//                         .postGraduationPercentage(
//                                 request.getPostGraduationPercentage())

//                         // Documents
//                         .passportPhoto(
//                                 passportPhoto)

//                         .aadharDocument(
//                                 aadharDocument)

//                         .tenthMarksheet(
//                                 tenthMarksheet)

//                         .twelfthMarksheet(
//                                 twelfthMarksheet)

//                         .bachelorMarksheet(
//                                 bachelorMarksheet)

//                         .masterMarksheet(
//                                 masterMarksheet)

//                         .familyIncomeCertificate(
//                                 familyIncomeCertificate)

//                         // Declaration
//                         .declarationAccepted(
//                                 request.getDeclarationAccepted())

//                         // Status
//                         .status(
//                                 DocumentationStatus.SUBMITTED)

//                         .active(true)

//                         .createdAt(now)

//                         .updatedAt(now)

//                         .build();


//         // -----------------------------------------------------
//         // 9. Save documentation
//         // -----------------------------------------------------

//         CandidateDocumentation savedDocumentation =
//                 documentationRepository.save(
//                         documentation);


//         // -----------------------------------------------------
//         // 10. Update application status
//         // -----------------------------------------------------

//         application.setStatus(
//                 ApplicationStatus.DOCUMENTS_SUBMITTED);

//         application.setUpdatedAt(
//                 LocalDateTime.now());

//         applicationRepository.save(application);


//         // -----------------------------------------------------
//         // 11. Return response
//         // -----------------------------------------------------

//         return mapToResponse(
//                 savedDocumentation);
//     }



@Override
public DocumentationResponse submitDocumentation(
        DocumentationSubmitRequest request) {

    System.out.println("========================================");
    System.out.println("START DOCUMENTATION SUBMISSION");
    System.out.println("========================================");

    if (request == null) {
        throw new IllegalArgumentException(
                "Documentation request cannot be null");
    }

    System.out.println("Application ID received: "
            + request.getApplicationId());

    System.out.println("Candidate name received: "
            + request.getCandidateName());

    System.out.println("Declaration accepted: "
            + request.getDeclarationAccepted());

    // -----------------------------------------------------
    // 1. Find application
    // -----------------------------------------------------

    Application application =
            applicationRepository
                    .findById(request.getApplicationId())
                    .or(() ->
                            applicationRepository
                                    .findByApplicationNumber(
                                            request.getApplicationId()
                                    ))
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Application not found with id or application number: "
                                            + request.getApplicationId()
                            ));

    System.out.println("Application found");
    System.out.println("Mongo Application ID: "
            + application.getId());
    System.out.println("Application Number: "
            + application.getApplicationNumber());
    System.out.println("Application Status: "
            + application.getStatus());

    // -----------------------------------------------------
    // 2. Check application status
    // -----------------------------------------------------

    ApplicationStatus currentStatus =
            application.getStatus();

    if (currentStatus != ApplicationStatus.SUBMITTED
            && currentStatus != ApplicationStatus.APTITUDE_PASSED
            && currentStatus != ApplicationStatus.DOCUMENTATION_PENDING
            && currentStatus != ApplicationStatus.DOCUMENTS_REJECTED) {

        throw new IllegalStateException(
                "Documentation cannot be submitted. "
                        + "Current application status is: "
                        + currentStatus);
    }

    // -----------------------------------------------------
    // 3. Prevent duplicate documentation
    // IMPORTANT:
    // Always use the actual MongoDB Application ID.
    // -----------------------------------------------------

    if (documentationRepository
            .existsByApplicationId(application.getId())) {

        throw new ResourceAlreadyExistsException(
                "Documentation already exists for application: "
                        + application.getId());
    }

    // -----------------------------------------------------
    // 4. Validate declaration
    // -----------------------------------------------------

    if (!Boolean.TRUE.equals(
            request.getDeclarationAccepted())) {

        throw new IllegalArgumentException(
                "Candidate must accept the declaration");
    }

    // -----------------------------------------------------
    // 5. Validate uploaded files
    // -----------------------------------------------------

    validateRequiredFile(
            request.getPassportPhoto(),
            "Passport photograph");

    validateRequiredFile(
            request.getAadharDocument(),
            "Aadhar document");

    validateRequiredFile(
            request.getTenthMarksheet(),
            "10th marksheet");

    validateRequiredFile(
            request.getTwelfthMarksheet(),
            "12th marksheet");

    validateRequiredFile(
            request.getBachelorMarksheet(),
            "Bachelor marksheet");

    if (request.getFamilyIncomeCertificate() != null
            && !request.getFamilyIncomeCertificate().isEmpty()) {
        validateRequiredFile(
                request.getFamilyIncomeCertificate(),
                "Family income certificate");
    }

    System.out.println("All required files validated successfully");

    // -----------------------------------------------------
    // 6. Create candidate directory
    // -----------------------------------------------------

    String applicationNumber =
            application.getApplicationNumber();

    String safeApplicationNumber =
            sanitizePathPart(applicationNumber);

    Path candidateDirectory =
            Paths.get(
                    uploadDirectory,
                    "documentation",
                    safeApplicationNumber
            );

    try {

        Files.createDirectories(candidateDirectory);

    } catch (IOException exception) {

        throw new RuntimeException(
                "Unable to create document storage directory",
                exception);
    }

    // -----------------------------------------------------
    // 7. Store uploaded files
    // -----------------------------------------------------

    String passportPhoto =
            storeFile(
                    request.getPassportPhoto(),
                    candidateDirectory,
                    "passport-photo");
    String passportPhotoName =
            fileNameOnly(request.getPassportPhoto());

    String aadharDocument =
            storeFile(
                    request.getAadharDocument(),
                    candidateDirectory,
                    "aadhar");
    String aadharDocumentName =
            fileNameOnly(request.getAadharDocument());

    String tenthMarksheet =
            storeFile(
                    request.getTenthMarksheet(),
                    candidateDirectory,
                    "10th-marksheet");
    String tenthMarksheetName =
            fileNameOnly(request.getTenthMarksheet());

    String twelfthMarksheet =
            storeFile(
                    request.getTwelfthMarksheet(),
                    candidateDirectory,
                    "12th-marksheet");
    String twelfthMarksheetName =
            fileNameOnly(request.getTwelfthMarksheet());

    String bachelorMarksheet =
            storeFile(
                    request.getBachelorMarksheet(),
                    candidateDirectory,
                    "bachelor-marksheet");
    String bachelorMarksheetName =
            fileNameOnly(request.getBachelorMarksheet());

    String masterMarksheet = null;
    String masterMarksheetName = null;

    if (request.getMasterMarksheet() != null
            && !request.getMasterMarksheet().isEmpty()) {

        masterMarksheet =
                storeFile(
                        request.getMasterMarksheet(),
                        candidateDirectory,
                        "master-marksheet");
        masterMarksheetName =
                fileNameOnly(request.getMasterMarksheet());
    }

    String familyIncomeCertificate = null;
    String familyIncomeCertificateName = null;
    if (request.getFamilyIncomeCertificate() != null
            && !request.getFamilyIncomeCertificate().isEmpty()) {
        familyIncomeCertificate =
                storeFile(
                        request.getFamilyIncomeCertificate(),
                        candidateDirectory,
                        "family-income-certificate");
        familyIncomeCertificateName =
                fileNameOnly(request.getFamilyIncomeCertificate());
    }

    System.out.println("All files stored successfully");

    // -----------------------------------------------------
    // 8. Create CandidateDocumentation
    // -----------------------------------------------------

    LocalDateTime now =
            LocalDateTime.now();

    CandidateDocumentation documentation =
            CandidateDocumentation.builder()

                    // IMPORTANT:
                    // Store actual MongoDB Application ID
                    .applicationId(
                            application.getId())

                    .applicationNumber(
                            application.getApplicationNumber())

                    // Personal details
                    .candidateName(
                            request.getCandidateName())

                    .dateOfBirth(
                            request.getDateOfBirth())

                    .age(
                            request.getAge())

                    .gender(
                            request.getGender())

                    .otherGender(
                            request.getOtherGender())

                    .fatherName(
                            request.getFatherName())

                    .fatherOccupation(
                            request.getFatherOccupation())

                    .motherName(
                            request.getMotherName())

                    .motherOccupation(
                            request.getMotherOccupation())

                    .firstGraduate(
                            request.getFirstGraduate())

                    .maritalStatus(
                            request.getMaritalStatus())

                    // Mailing address
                    .mailingFullName(
                            request.getMailingFullName())

                    .mailingAddress(
                            request.getMailingAddress())

                    .mailingPincode(
                            request.getMailingPincode())

                    .personalMobile(
                            request.getPersonalMobile())

                    .personalEmail(
                            request.getPersonalEmail())

                    // Guardian
                    .guardianFullName(
                            request.getGuardianFullName())

                    .guardianAddress(
                            request.getGuardianAddress())

                    .guardianPincode(
                            request.getGuardianPincode())

                    .guardianMobile(
                            request.getGuardianMobile())

                    .guardianLandline(
                            request.getGuardianLandline())

                    // 10th
                    .tenthSchoolName(
                            request.getTenthSchoolName())

                    .tenthBoard(
                            request.getTenthBoard())

                    .tenthPassingYear(
                            request.getTenthPassingYear())

                    .tenthMarks(
                            request.getTenthMarks())

                    .tenthPercentage(
                            request.getTenthPercentage())

                    // 12th
                    .twelfthSchoolName(
                            request.getTwelfthSchoolName())

                    .twelfthBoard(
                            request.getTwelfthBoard())

                    .twelfthPassingYear(
                            request.getTwelfthPassingYear())

                    .twelfthMarks(
                            request.getTwelfthMarks())

                    .twelfthPercentage(
                            request.getTwelfthPercentage())

                    // Graduation
                    .graduationCollege(
                            request.getGraduationCollege())

                    .graduationDegree(
                            request.getGraduationDegree())

                    .graduationMarks(
                            request.getGraduationMarks())

                    .graduationPercentage(
                            request.getGraduationPercentage())

                    .graduationPassingYear(
                            request.getGraduationPassingYear())

                    // Post graduation
                    .postGraduationCollege(
                            request.getPostGraduationCollege())

                    .postGraduationDegree(
                            request.getPostGraduationDegree())

                    .postGraduationPassingYear(
                            request.getPostGraduationPassingYear())

                    .postGraduationMarks(
                            request.getPostGraduationMarks())

                    .postGraduationPercentage(
                            request.getPostGraduationPercentage())

                    // Documents
                    .passportPhoto(
                            passportPhoto)
                    .passportPhotoName(
                            passportPhotoName)

                    .aadharDocument(
                            aadharDocument)
                    .aadharDocumentName(
                            aadharDocumentName)

                    .tenthMarksheet(
                            tenthMarksheet)
                    .tenthMarksheetName(
                            tenthMarksheetName)

                    .twelfthMarksheet(
                            twelfthMarksheet)
                    .twelfthMarksheetName(
                            twelfthMarksheetName)

                    .bachelorMarksheet(
                            bachelorMarksheet)
                    .bachelorMarksheetName(
                            bachelorMarksheetName)

                    .masterMarksheet(
                            masterMarksheet)
                    .masterMarksheetName(
                            masterMarksheetName)

                    .familyIncomeCertificate(
                            familyIncomeCertificate)
                    .familyIncomeCertificateName(
                            familyIncomeCertificateName)

                    // Declaration
                    .declarationAccepted(
                            request.getDeclarationAccepted())

                    // Status
                    .status(
                            DocumentationStatus.SUBMITTED)

                    .active(true)

                    .createdAt(now)

                    .updatedAt(now)

                    .build();

    // -----------------------------------------------------
    // 9. SAVE TO MONGODB
    // -----------------------------------------------------

    System.out.println("========================================");
    System.out.println("SAVING DOCUMENTATION TO MONGODB");
    System.out.println("Application ID: "
            + documentation.getApplicationId());
    System.out.println("Application Number: "
            + documentation.getApplicationNumber());
    System.out.println("Candidate Name: "
            + documentation.getCandidateName());
    System.out.println("========================================");

    CandidateDocumentation savedDocumentation =
            documentationRepository.save(
                    documentation);

    System.out.println("========================================");
    System.out.println("MONGODB SAVE SUCCESSFUL");
    System.out.println("Documentation MongoDB ID: "
            + savedDocumentation.getId());
    System.out.println("========================================");

    // -----------------------------------------------------
    // 10. Update application status
    // -----------------------------------------------------

    application.setStatus(
            ApplicationStatus.DOCUMENTS_SUBMITTED);

    application.setUpdatedAt(
            LocalDateTime.now());

    applicationRepository.save(application);

    // -----------------------------------------------------
    // 11. Return response
    // -----------------------------------------------------

    return mapToResponse(
            savedDocumentation);
}



    // =========================================================
    // GET DOCUMENTATION BY ID
    // =========================================================

    @Override
    public DocumentationResponse getDocumentationById(
            String id) {

        CandidateDocumentation documentation =
                getDocumentation(id);

        return mapToResponse(
                documentation);
    }


    // =========================================================
    // GET DOCUMENTATION BY APPLICATION ID
    // =========================================================

    @Override
    public DocumentationResponse
            getDocumentationByApplicationId(
                    String applicationId) {

        CandidateDocumentation documentation =
                documentationRepository
                        .findByApplicationId(applicationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Documentation not found for application: "
                                                + applicationId));

        return mapToResponse(
                documentation);
    }


    // =========================================================
    // GET ALL DOCUMENTATIONS
    // =========================================================

    @Override
    public List<DocumentationResponse>
            getAllDocumentations() {

        return documentationRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    // =========================================================
    // GET BY STATUS
    // =========================================================

    @Override
    public List<DocumentationResponse>
            getDocumentationsByStatus(
                    DocumentationStatus status) {

        return documentationRepository
                .findAll()
                .stream()
                .filter(documentation ->
                        documentation.getStatus() == status)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    // =========================================================
    // VERIFY DOCUMENTATION
    // =========================================================

    @Override
    public DocumentationResponse verifyDocumentation(
            String id,
            String remarks) {

        CandidateDocumentation documentation =
                getDocumentation(id);


        // -----------------------------------------------------
        // Check current documentation status
        // -----------------------------------------------------

        if (documentation.getStatus()
                != DocumentationStatus.SUBMITTED) {

            throw new IllegalStateException(
                    "Only submitted documentation can be verified");
        }


        // -----------------------------------------------------
        // Update documentation
        // -----------------------------------------------------

        documentation.setStatus(
                DocumentationStatus.VERIFIED);

        documentation.setAdminRemarks(
                cleanRemarks(remarks));

        documentation.setUpdatedAt(
                LocalDateTime.now());

        CandidateDocumentation updatedDocumentation =
                documentationRepository.save(
                        documentation);


        // -----------------------------------------------------
        // Update application status
        // -----------------------------------------------------

        Application application =
                applicationRepository
                        .findById(
                                documentation.getApplicationId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Application not found with id: "
                                                + documentation
                                                        .getApplicationId()));

        application.setStatus(
                ApplicationStatus.DOCUMENTS_VERIFIED);

        application.setUpdatedAt(
                LocalDateTime.now());

        applicationRepository.save(application);


        return mapToResponse(
                updatedDocumentation);
    }


    // =========================================================
    // REJECT DOCUMENTATION
    // =========================================================

    @Override
    public DocumentationResponse rejectDocumentation(
            String id,
            String remarks) {

        CandidateDocumentation documentation =
                getDocumentation(id);


        if (documentation.getStatus()
                != DocumentationStatus.SUBMITTED) {

            throw new IllegalStateException(
                    "Only submitted documentation can be rejected");
        }


        documentation.setStatus(
                DocumentationStatus.REJECTED);

        documentation.setAdminRemarks(
                cleanRemarks(remarks));

        documentation.setUpdatedAt(
                LocalDateTime.now());

        CandidateDocumentation updatedDocumentation =
                documentationRepository.save(
                        documentation);


        // -----------------------------------------------------
        // Update application status
        // -----------------------------------------------------

        Application application =
                applicationRepository
                        .findById(
                                documentation.getApplicationId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Application not found with id: "
                                                + documentation
                                                        .getApplicationId()));

        application.setStatus(
                ApplicationStatus.DOCUMENTS_REJECTED);

        application.setUpdatedAt(
                LocalDateTime.now());

        applicationRepository.save(application);


        return mapToResponse(
                updatedDocumentation);
    }


    // =========================================================
    // GET DOCUMENTATION
    // =========================================================

    private CandidateDocumentation getDocumentation(
            String id) {

        if (id == null || id.isBlank()) {

            throw new IllegalArgumentException(
                    "Documentation ID is required");
        }

        return documentationRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Documentation not found with id: "
                                        + id));
    }


    // =========================================================
    // STORE FILE
    // =========================================================

    private String storeFile(
            MultipartFile file,
            Path directory,
            String documentName) {

        validateRequiredFile(
                file,
                documentName);


        String originalFilename =
                StringUtils.cleanPath(
                        file.getOriginalFilename() == null
                                ? ""
                                : file.getOriginalFilename());


        String extension = "";

        int lastDot =
                originalFilename.lastIndexOf('.');

        if (lastDot >= 0) {

            extension =
                    originalFilename
                            .substring(lastDot)
                            .toLowerCase();
        }


        String filename =
                documentName
                        + "-"
                        + UUID.randomUUID()
                        + extension;


        Path destination =
                directory.resolve(filename)
                        .normalize();


        /*
         * Security check:
         *
         * Prevent a malicious filename from escaping
         * the candidate directory.
         */
        if (!destination.startsWith(
                directory.normalize())) {

            throw new IllegalArgumentException(
                    "Invalid file name");
        }


        try (InputStream inputStream =
                     file.getInputStream()) {

            Files.copy(
                    inputStream,
                    destination,
                    StandardCopyOption.REPLACE_EXISTING);

        } catch (IOException exception) {

            throw new RuntimeException(
                    "Failed to store document: "
                            + documentName,
                    exception);
        }


        /*
         * Store a relative path in MongoDB.
         */
        return destination
                .toString()
                .replace("\\", "/");
    }


    // =========================================================
    // FILE VALIDATION
    // =========================================================

    private void validateRequiredFile(
            MultipartFile file,
            String fieldName) {

        if (file == null
                || file.isEmpty()) {

            throw new IllegalArgumentException(
                    fieldName + " is required");
        }


        String contentType =
                file.getContentType();


        if (contentType == null
                || !(contentType.equalsIgnoreCase(
                            "application/pdf")
                    || contentType.equalsIgnoreCase(
                            "image/jpeg")
                    || contentType.equalsIgnoreCase(
                            "image/png")
                    || contentType.equalsIgnoreCase(
                            "image/jpg"))) {

            throw new IllegalArgumentException(
                    "Invalid file type for "
                            + fieldName
                            + ". Only PDF, JPG and PNG are allowed");
        }
    }


    // =========================================================
    // SANITIZE PATH
    // =========================================================

    private String sanitizePathPart(
            String value) {

        if (value == null
                || value.isBlank()) {

            return "unknown-application";
        }

        return value
                .replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private String fileNameOnly(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String originalFileName = StringUtils.cleanPath(
                file.getOriginalFilename() == null ? "" : file.getOriginalFilename());

        return originalFileName.isBlank() ? null : originalFileName;
    }

    @Override
    public DocumentFileContent getDocumentFile(
            String applicationId,
            String documentType) {

        CandidateDocumentation documentation = documentationRepository.findByApplicationId(applicationId)
                .orElse(null);

        if (documentation == null) {
            Application application = applicationRepository.findByApplicationNumber(applicationId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Documentation not found for application: " + applicationId));
            documentation = documentationRepository.findByApplicationId(application.getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Documentation not found for application: " + applicationId));
        }

        String storedPath = switch (documentType) {
            case "passportPhoto" -> documentation.getPassportPhoto();
            case "aadharDocument" -> documentation.getAadharDocument();
            case "tenthMarksheet" -> documentation.getTenthMarksheet();
            case "twelfthMarksheet" -> documentation.getTwelfthMarksheet();
            case "bachelorMarksheet" -> documentation.getBachelorMarksheet();
            case "masterMarksheet" -> documentation.getMasterMarksheet();
            case "familyIncomeCertificate" -> documentation.getFamilyIncomeCertificate();
            default -> null;
        };

        if (storedPath == null || storedPath.isBlank()) {
            throw new ResourceNotFoundException(
                    "Document not found for type: " + documentType);
        }

        Path filePath = Paths.get(storedPath).normalize();
        if (!Files.exists(filePath)) {
            throw new ResourceNotFoundException(
                    "Stored document file not found for type: " + documentType);
        }

        String resolvedName = switch (documentType) {
            case "passportPhoto" -> documentation.getPassportPhotoName();
            case "aadharDocument" -> documentation.getAadharDocumentName();
            case "tenthMarksheet" -> documentation.getTenthMarksheetName();
            case "twelfthMarksheet" -> documentation.getTwelfthMarksheetName();
            case "bachelorMarksheet" -> documentation.getBachelorMarksheetName();
            case "masterMarksheet" -> documentation.getMasterMarksheetName();
            case "familyIncomeCertificate" -> documentation.getFamilyIncomeCertificateName();
            default -> null;
        };

        String fileName = resolvedName != null && !resolvedName.isBlank()
                ? resolvedName
                : filePath.getFileName() != null ? filePath.getFileName().toString() : "document";

        String contentType;
        try {
            contentType = Files.probeContentType(filePath);
        } catch (IOException e) {
            contentType = null;
        }

        if (contentType == null || contentType.isBlank()) {
            String lowerName = fileName.toLowerCase();
            if (lowerName.endsWith(".pdf")) contentType = "application/pdf";
            else if (lowerName.endsWith(".png")) contentType = "image/png";
            else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) contentType = "image/jpeg";
            else contentType = "application/octet-stream";
        }

        return new DocumentFileContent(fileName, contentType, new org.springframework.core.io.FileSystemResource(filePath));
    }


    // =========================================================
    // CLEAN REMARKS
    // =========================================================

    private String cleanRemarks(
            String remarks) {

        if (remarks == null) {
            return null;
        }

        String cleaned =
                remarks.trim();

        return cleaned.isEmpty()
                ? null
                : cleaned;
    }


    // =========================================================
    // MAP ENTITY → RESPONSE
    // =========================================================

    private DocumentationResponse mapToResponse(
            CandidateDocumentation documentation) {

        return DocumentationResponse.builder()

                .id(documentation.getId())

                .applicationId(
                        documentation.getApplicationId())

                .applicationNumber(
                        documentation.getApplicationNumber())

                // Personal
                .candidateName(
                        documentation.getCandidateName())

                .dateOfBirth(
                        documentation.getDateOfBirth())

                .age(
                        documentation.getAge())

                .gender(
                        documentation.getGender())

                .otherGender(
                        documentation.getOtherGender())

                .fatherName(
                        documentation.getFatherName())

                .fatherOccupation(
                        documentation.getFatherOccupation())

                .motherName(
                        documentation.getMotherName())

                .motherOccupation(
                        documentation.getMotherOccupation())

                .firstGraduate(
                        documentation.getFirstGraduate())

                .maritalStatus(
                        documentation.getMaritalStatus())

                // Mailing
                .mailingFullName(
                        documentation.getMailingFullName())

                .mailingAddress(
                        documentation.getMailingAddress())

                .mailingPincode(
                        documentation.getMailingPincode())

                .personalMobile(
                        documentation.getPersonalMobile())

                .personalEmail(
                        documentation.getPersonalEmail())

                // Guardian
                .guardianFullName(
                        documentation.getGuardianFullName())

                .guardianAddress(
                        documentation.getGuardianAddress())

                .guardianPincode(
                        documentation.getGuardianPincode())

                .guardianMobile(
                        documentation.getGuardianMobile())

                .guardianLandline(
                        documentation.getGuardianLandline())

                // 10th
                .tenthSchoolName(
                        documentation.getTenthSchoolName())

                .tenthBoard(
                        documentation.getTenthBoard())

                .tenthPassingYear(
                        documentation.getTenthPassingYear())

                .tenthMarks(
                        documentation.getTenthMarks())

                .tenthPercentage(
                        documentation.getTenthPercentage())

                // 12th
                .twelfthSchoolName(
                        documentation.getTwelfthSchoolName())

                .twelfthBoard(
                        documentation.getTwelfthBoard())

                .twelfthPassingYear(
                        documentation.getTwelfthPassingYear())

                .twelfthMarks(
                        documentation.getTwelfthMarks())

                .twelfthPercentage(
                        documentation.getTwelfthPercentage())

                // Graduation
                .graduationCollege(
                        documentation.getGraduationCollege())

                .graduationDegree(
                        documentation.getGraduationDegree())

                .graduationMarks(
                        documentation.getGraduationMarks())

                .graduationPercentage(
                        documentation.getGraduationPercentage())

                .graduationPassingYear(
                        documentation.getGraduationPassingYear())

                // Post graduation
                .postGraduationCollege(
                        documentation
                                .getPostGraduationCollege())

                .postGraduationDegree(
                        documentation
                                .getPostGraduationDegree())

                .postGraduationPassingYear(
                        documentation
                                .getPostGraduationPassingYear())

                .postGraduationMarks(
                        documentation
                                .getPostGraduationMarks())

                .postGraduationPercentage(
                        documentation
                                .getPostGraduationPercentage())

                // Documents
                .passportPhoto(
                        documentation.getPassportPhoto())
                .passportPhotoName(
                        documentation.getPassportPhotoName())

                .aadharDocument(
                        documentation.getAadharDocument())
                .aadharDocumentName(
                        documentation.getAadharDocumentName())

                .tenthMarksheet(
                        documentation.getTenthMarksheet())
                .tenthMarksheetName(
                        documentation.getTenthMarksheetName())

                .twelfthMarksheet(
                        documentation.getTwelfthMarksheet())
                .twelfthMarksheetName(
                        documentation.getTwelfthMarksheetName())

                .bachelorMarksheet(
                        documentation.getBachelorMarksheet())
                .bachelorMarksheetName(
                        documentation.getBachelorMarksheetName())

                .masterMarksheet(
                        documentation.getMasterMarksheet())
                .masterMarksheetName(
                        documentation.getMasterMarksheetName())

                .familyIncomeCertificate(
                        documentation
                                .getFamilyIncomeCertificate())
                .familyIncomeCertificateName(
                        documentation.getFamilyIncomeCertificateName())

                // Declaration
                .declarationAccepted(
                        documentation
                                .getDeclarationAccepted())

                // Status
                .status(
                        documentation.getStatus())

                .adminRemarks(
                        documentation.getAdminRemarks())

                // Audit
                .active(
                        documentation.getActive())

                .createdAt(
                        documentation.getCreatedAt())

                .updatedAt(
                        documentation.getUpdatedAt())

                .build();
    }
}