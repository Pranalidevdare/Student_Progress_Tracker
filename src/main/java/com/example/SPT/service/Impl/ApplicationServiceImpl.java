package com.example.SPT.service.Impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.SPT.dto.request.ApplicationCreateRequest;
import com.example.SPT.dto.request.ApplicationStatusUpdateRequest;
import com.example.SPT.dto.request.ApplicationUpdateRequest;
import com.example.SPT.dto.request.BatchAssignmentRequest;
import com.example.SPT.dto.response.ApplicationResponse;
import com.example.SPT.dto.response.BatchResponse;
import com.example.SPT.entity.Application;
import com.example.SPT.entity.Batch;
import com.example.SPT.enums.ApplicationStatus;
import com.example.SPT.enums.BatchStatus;
import com.example.SPT.exception.ResourceAlreadyExistsException;
import com.example.SPT.exception.ResourceNotFoundException;
import com.example.SPT.repository.ApplicationRepository;
import com.example.SPT.repository.BatchRepository;
import com.example.SPT.service.ApplicationService;
import com.example.SPT.service.BatchService;
import com.example.SPT.service.SequenceGeneratorService;

import lombok.RequiredArgsConstructor;
import com.example.SPT.dto.response.StudentResponse;
import com.example.SPT.entity.Student;
import com.example.SPT.entity.SelectionStatus;
import com.example.SPT.entity.User;
import com.example.SPT.enums.Role;
import com.example.SPT.repository.StudentRepository;
import com.example.SPT.repository.UserRepository;
import com.example.SPT.mapper.StudentMapper;
import com.example.SPT.mapper.ApplicationMapper;
import com.example.SPT.service.EmailService;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    
    private static final String APPLICATION_SEQUENCE = "application_sequence";
    
    private final SequenceGeneratorService sequenceGeneratorService;
    
    private final StudentRepository studentRepository;
    
    private final ApplicationMapper applicationMapper;

    private final UserRepository userRepository;

    private final StudentMapper studentMapper;

    private final EmailService emailService;

    private final BatchService batchService;

    private final BatchRepository batchRepository;
    
    private void validateApplication(ApplicationCreateRequest request) {

        if (applicationRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException(
                    "Application already exists with email : " + request.getEmail());
        }

        if (applicationRepository.existsByMobile(request.getMobile())) {
            throw new ResourceAlreadyExistsException(
                    "Application already exists with mobile number : " + request.getMobile());
        }
    }

    
    private Application mapToEntity(ApplicationCreateRequest request) {

        return Application.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .mobile(request.getMobile())
                .fatherOccupation(request.getFatherOccupation())
                .fatherContactNumber(request.getFatherContactNumber())
                .motherOccupation(request.getMotherOccupation())
                .motherContactNumber(request.getMotherContactNumber())
                .familyIncome(request.getFamilyIncome())
                .branch(request.getBranch())
                .yearOfStudy(request.getYearOfStudy())
                .collegeName(request.getCollegeName())
                .interestedInITEP(request.getInterestedInITEP())
                .joinedWhatsappGroup(request.getJoinedWhatsappGroup())
                .additionalComments(request.getAdditionalComments())
                .build();
    }
    
    private ApplicationResponse mapToResponse(Application application) {

        return ApplicationResponse.builder()
                .id(application.getId())
                .applicationNumber(application.getApplicationNumber())
                .status(application.getStatus())
                .fullName(application.getFullName())
                .email(application.getEmail())
                .mobile(application.getMobile())
                .collegeName(application.getCollegeName())
                .branch(application.getBranch())
                .yearOfStudy(application.getYearOfStudy())
                .familyIncome(application.getFamilyIncome())
                .interestedInITEP(application.getInterestedInITEP())
                .joinedWhatsappGroup(application.getJoinedWhatsappGroup())
                .adminRemarks(application.getAdminRemarks())
                .technicalInterviewRemarks(application.getTechnicalInterviewRemarks())
                .hrInterviewRemarks(application.getHrInterviewRemarks())
                .assignedBatchId(application.getAssignedBatchId())
                .assignedBatchName(application.getAssignedBatchName())
                .createdAt(application.getCreatedAt())
                .build();
    }
    
    @Override
    public ApplicationResponse submitApplication(
            ApplicationCreateRequest request) {

        validateApplication(request);

        Application application = mapToEntity(request);

        long sequence = sequenceGeneratorService
                .generateSequence(APPLICATION_SEQUENCE);

        application.setApplicationNumber(
                String.format(
                        "APP-%d-%06d",
                        LocalDate.now().getYear(),
                        sequence));

        
        if (request.getFamilyIncome() != null && request.getFamilyIncome() <= 400000) {

            application.setStatus(
                    ApplicationStatus.ELIGIBLE_FOR_APTITUDE);

        } else {

            application.setStatus(
                    ApplicationStatus.NOT_ELIGIBLE);
        }

        application.setActive(true);
        application.setCreatedAt(LocalDateTime.now());
        application.setUpdatedAt(LocalDateTime.now());

        Application savedApplication =
                applicationRepository.save(application);

        // Send Automated Emails to Registered Candidate
        try {
            String currentDate = LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy"));
            emailService.sendRegistrationConfirmationEmail(
                    savedApplication.getEmail(),
                    savedApplication.getFullName(),
                    savedApplication.getApplicationNumber(),
                    "Information Technology Excellence Program (ITEP)",
                    currentDate);

            if (savedApplication.getStatus() == ApplicationStatus.ELIGIBLE_FOR_APTITUDE) {
                emailService.sendAptitudeEligibilityEmail(
                        savedApplication.getEmail(),
                        savedApplication.getFullName());
            }
        } catch (Exception e) {
            System.err.println("Registration & Aptitude Eligibility email warning: " + e.getMessage());
        }

        return mapToResponse(savedApplication);
    }
    
    @Override
    public List<ApplicationResponse> getAllApplications() {

        return applicationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    
    @Override
    public ApplicationResponse getApplicationById(String id) {

        Application application = applicationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Application not found with id : " + id));

        return mapToResponse(application);
    }
    
    @Override
    public ApplicationResponse getApplicationByApplicationNumber(
            String applicationNumber) {

        Application application = applicationRepository
                .findByApplicationNumber(applicationNumber)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Application not found with application number : "
                                        + applicationNumber));

        return mapToResponse(application);
    }
    
    @Override
    public List<ApplicationResponse> searchByName(String name) {

        return applicationRepository
                .findByFullNameContainingIgnoreCase(name)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    
    @Override
    public List<ApplicationResponse> getApplicationsByStatus(
            ApplicationStatus status) {

        return applicationRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    
    
    @Override
    public ApplicationResponse updateApplication(
            String id,
            ApplicationUpdateRequest request) {

        Application application = getApplication(id);

        application.setFullName(request.getFullName());

        application.setFatherOccupation(
                request.getFatherOccupation());

        application.setFatherContactNumber(
                request.getFatherContactNumber());

        application.setMotherOccupation(
                request.getMotherOccupation());

        application.setMotherContactNumber(
                request.getMotherContactNumber());

        application.setFamilyIncome(
                request.getFamilyIncome());

        application.setBranch(
                request.getBranch());

        application.setYearOfStudy(
                request.getYearOfStudy());

        application.setCollegeName(
                request.getCollegeName());

        application.setInterestedInITEP(
                request.getInterestedInITEP());

        application.setJoinedWhatsappGroup(
                request.getJoinedWhatsappGroup());

        application.setAdditionalComments(
                request.getAdditionalComments());

        application.setUpdatedAt(LocalDateTime.now());

        Application updatedApplication =
                applicationRepository.save(application);

        return mapToResponse(updatedApplication);
    }
    
    @Override
    public void deleteApplication(String id) {

        Application application = getApplication(id);

        application.setActive(false);
        application.setUpdatedAt(LocalDateTime.now());

        applicationRepository.save(application);
    }
    
    @Override
    public ApplicationResponse updateApplicationStatus(
            String id,
            ApplicationStatusUpdateRequest request) {

        Application application = getApplication(id);
        ApplicationStatus nextStatus = request.getStatus();

        if (nextStatus == null) {
            throw new IllegalArgumentException("Status is required");
        }

        validateStatusTransition(application.getStatus(), nextStatus);

        application.setStatus(nextStatus);

        if (request.getRemarks() != null
                && !request.getRemarks().trim().isEmpty()) {

            application.setAdminRemarks(
                    request.getRemarks().trim());
        }

        if (nextStatus == ApplicationStatus.HOME_VISIT_PASSED) {
            application.setStatus(ApplicationStatus.HOME_VISIT_PASSED);
        }

        if (nextStatus == ApplicationStatus.HOME_VISIT_REJECTED) {
            application.setStatus(ApplicationStatus.HOME_VISIT_REJECTED);
        }

        application.setUpdatedAt(LocalDateTime.now());

        Application updatedApplication =
                applicationRepository.save(application);

        if (nextStatus == ApplicationStatus.HOME_VISIT_PASSED || nextStatus == ApplicationStatus.HOME_VISIT_REJECTED) {
            emailService.sendHomeVisitDecisionEmail(
                    application.getEmail(),
                    application.getFullName(),
                    nextStatus == ApplicationStatus.HOME_VISIT_PASSED,
                    request.getRemarks());
        }

        return mapToResponse(updatedApplication);
    }

    private void validateStatusTransition(ApplicationStatus currentStatus, ApplicationStatus nextStatus) {
        if (currentStatus == null || nextStatus == null || currentStatus == nextStatus) {
            return;
        }

        if (currentStatus == ApplicationStatus.REJECTED && nextStatus != ApplicationStatus.REJECTED) {
            throw new IllegalStateException("Rejected applications cannot move forward");
        }

        if (currentStatus == ApplicationStatus.BATCH_ASSIGNED && nextStatus != ApplicationStatus.BATCH_ASSIGNED) {
            throw new IllegalStateException("Batch-assigned applications are in a terminal state");
        }

        // Prevent proceeding if candidate failed a previous stage
        if (currentStatus == ApplicationStatus.TECHNICAL_INTERVIEW_FAILED
                || currentStatus == ApplicationStatus.HR_INTERVIEW_FAILED
                || currentStatus == ApplicationStatus.DOCUMENTS_REJECTED
                || currentStatus == ApplicationStatus.APTITUDE_FAILED
                || currentStatus == ApplicationStatus.NOT_ELIGIBLE) {
            if (nextStatus != ApplicationStatus.REJECTED && nextStatus != currentStatus) {
                throw new IllegalStateException("Candidate failed an earlier stage (" + currentStatus + ") and cannot proceed to " + nextStatus);
            }
        }

        if (currentStatus == ApplicationStatus.HOME_VISIT_PASSED
                || currentStatus == ApplicationStatus.HOME_VISIT_REJECTED) {
            if (nextStatus != ApplicationStatus.SELECTED && nextStatus != ApplicationStatus.BATCH_ASSIGNED && nextStatus != currentStatus) {
                throw new IllegalStateException("This application has already completed home visit processing");
            }
        }

        // Technical Interview stage: requires verified documents
        if (nextStatus == ApplicationStatus.TECHNICAL_INTERVIEW_SCHEDULED
                || nextStatus == ApplicationStatus.TECHNICAL_INTERVIEW_PASSED
                || nextStatus == ApplicationStatus.TECHNICAL_INTERVIEW_FAILED) {
            if (currentStatus != ApplicationStatus.DOCUMENTS_VERIFIED
                    && currentStatus != ApplicationStatus.TECHNICAL_INTERVIEW_SCHEDULED
                    && currentStatus != ApplicationStatus.TECHNICAL_INTERVIEW_PASSED
                    && currentStatus != ApplicationStatus.TECHNICAL_INTERVIEW_FAILED) {
                throw new IllegalStateException("Technical Interview requires verified documents (current status: " + currentStatus + ")");
            }
        }

        // HR / Soft-Skill Interview stage: requires passed Technical Interview
        if (nextStatus == ApplicationStatus.HR_INTERVIEW_SCHEDULED
                || nextStatus == ApplicationStatus.HR_INTERVIEW_PASSED
                || nextStatus == ApplicationStatus.HR_INTERVIEW_FAILED) {
            if (currentStatus != ApplicationStatus.TECHNICAL_INTERVIEW_PASSED
                    && currentStatus != ApplicationStatus.HR_INTERVIEW_SCHEDULED
                    && currentStatus != ApplicationStatus.HR_INTERVIEW_PASSED
                    && currentStatus != ApplicationStatus.HR_INTERVIEW_FAILED) {
                throw new IllegalStateException("HR/Soft-Skill Interview requires passed Technical Interview (current status: " + currentStatus + ")");
            }
        }

        // Home Visit stage: requires passed HR and Technical Interviews
        if (nextStatus == ApplicationStatus.HOME_VISIT_PENDING
                || nextStatus == ApplicationStatus.HOME_VISIT_COMPLETED) {
            if (currentStatus != ApplicationStatus.HR_INTERVIEW_PASSED
                    && currentStatus != ApplicationStatus.HOME_VISIT_PENDING
                    && currentStatus != ApplicationStatus.HOME_VISIT_COMPLETED) {
                throw new IllegalStateException("Home visit can only be initiated after candidate has passed both Technical and HR interviews (current status: " + currentStatus + ")");
            }
        }

        if (nextStatus == ApplicationStatus.HOME_VISIT_PASSED
                || nextStatus == ApplicationStatus.HOME_VISIT_REJECTED) {
            if (currentStatus != ApplicationStatus.HOME_VISIT_COMPLETED
                    && currentStatus != ApplicationStatus.HOME_VISIT_PENDING
                    && currentStatus != ApplicationStatus.HR_INTERVIEW_PASSED) {
                throw new IllegalStateException("Home visit decision can only be recorded after home visit stage is active (current status: " + currentStatus + ")");
            }
        }

        // Final Selection stage: requires completed home visit
        if (nextStatus == ApplicationStatus.SELECTED) {
            if (currentStatus != ApplicationStatus.HOME_VISIT_COMPLETED
                    && currentStatus != ApplicationStatus.HOME_VISIT_PASSED
                    && currentStatus != ApplicationStatus.SELECTED
                    && currentStatus != ApplicationStatus.BATCH_ASSIGNED) {
                throw new IllegalStateException("Final selection requires completed home visit (current status: " + currentStatus + ")");
            }
        }
    }
    
    @Override
    public StudentResponse createStudentFromSelectedApplication(
            String applicationId) {

        Application application = getApplication(applicationId);

        if (application.getStatus() == ApplicationStatus.ENROLLED || studentRepository.existsByEmail(application.getEmail())) {
            throw new ResourceAlreadyExistsException("Application has already been converted to a Student.");
        }

        if (application.getStatus() != ApplicationStatus.HOME_VISIT_PASSED
                && application.getStatus() != ApplicationStatus.HOME_VISIT_COMPLETED
                && application.getStatus() != ApplicationStatus.SELECTED
                && application.getStatus() != ApplicationStatus.BATCH_ASSIGNED) {

            throw new IllegalStateException(
                    "Student cannot be created. Application is not in a selectable state. Current status: "
                    + application.getStatus());
        }

        // Validate batch is assigned
        if (application.getAssignedBatchId() == null || application.getAssignedBatchId().isEmpty()) {
            throw new IllegalStateException(
                    "Cannot create student account. No batch has been assigned to this candidate.");
        }

        // Validate batch still exists and is active
        Batch batch = batchRepository.findById(application.getAssignedBatchId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Assigned batch not found with ID: " + application.getAssignedBatchId()));

        if (batch.getStatus() != BatchStatus.ACTIVE) {
            throw new IllegalStateException(
                    "Assigned batch is not active. Current status: " + batch.getStatus());
        }

        String temporaryPassword = "student123";
        String encodedPassword = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode(temporaryPassword);

        User user = userRepository.findByEmail(application.getEmail())
                .or(() -> userRepository.findByEmail(application.getEmail().toLowerCase()))
                .orElse(null);

        if (user != null) {
            user.setFullName(application.getFullName());
            user.setPhone(application.getMobile());
            user.setRole(Role.STUDENT);
            user.setEnabled(true);
            user.setPassword(encodedPassword);
            user.setMustChangePassword(true);
            user.setUpdatedAt(LocalDateTime.now());
        } else {
            user = User.builder()
                    .fullName(application.getFullName())
                    .email(application.getEmail())
                    .password(encodedPassword)
                    .phone(application.getMobile())
                    .role(Role.STUDENT)
                    .enabled(true)
                    .mustChangePassword(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
        }

        User savedUser = userRepository.save(user);

        // Generate unique Student ID
        String studentId;
        do {
            long seq = sequenceGeneratorService.generateSequence("student_sequence");
            studentId = String.format("STU%04d", seq);
        } while (studentRepository.existsByStudentId(studentId));

        Student student = new Student();
        student.setStudentId(studentId);
        student.setFirstName(extractFirstName(application.getFullName()));
        student.setLastName(extractLastName(application.getFullName()));
        student.setEmail(application.getEmail());
        student.setMobile(application.getMobile());
        student.setCollegeName(application.getCollegeName());
        student.setBranch(application.getBranch());
        student.setActive(true);
        student.setSelectionStatus(SelectionStatus.SELECTED);
        student.setBatchId(application.getAssignedBatchId());
        student.setBatchName(application.getAssignedBatchName());

        LocalDateTime now = LocalDateTime.now();
        student.setCreatedAt(now);
        student.setUpdatedAt(now);

        Student savedStudent = studentRepository.save(student);

        application.setStatus(ApplicationStatus.ENROLLED);
        application.setUserId(savedUser.getId());
        application.setUpdatedAt(now);
        applicationRepository.save(application);

        try {
            emailService.sendStudentCredentialsEmail(
                    application.getEmail(),
                    application.getFullName(),
                    studentId,
                    temporaryPassword,
                    "http://localhost:5173/login");
        } catch (Exception e) {
            System.err.println("Student credentials email warning: " + e.getMessage());
        }

        try {
            emailService.sendOfferLetterEmail(
                    savedStudent.getEmail(),
                    application.getFullName(),
                    savedStudent.getBatchName(),
                    batch.getCourseName(),
                    batch.getStartDate(),
                    batch.getTechnicalTrainer() != null ? batch.getTechnicalTrainer().getFullName() : "TBD");
        } catch (Exception e) {
            System.err.println("Offer letter email warning: " + e.getMessage());
        }

        return studentMapper.toResponse(savedStudent);
    }
    
    
    private String extractFirstName(String fullName) {

        if (fullName == null || fullName.isBlank()) {
            return "";
        }

        String name = fullName.trim();

        int spaceIndex = name.indexOf(" ");

        if (spaceIndex == -1) {
            return name;
        }

        return name.substring(0, spaceIndex);
    }
    
    private String extractLastName(String fullName) {

        if (fullName == null || fullName.isBlank()) {
            return "";
        }

        String name = fullName.trim();

        int spaceIndex = name.indexOf(" ");

        if (spaceIndex == -1) {
            return "";
        }

        return name.substring(spaceIndex + 1).trim();
    }
    
    private Application getApplication(String id) {
        if (id == null || id.isBlank()) {
            throw new ResourceNotFoundException("Application ID cannot be empty");
        }
        return applicationRepository.findById(id.trim())
                .or(() -> applicationRepository.findByApplicationNumber(id.trim()))
                .or(() -> applicationRepository.findByEmail(id.trim()))
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Application not found with id : " + id));
    }

    @Override
    public ApplicationResponse assignBatch(BatchAssignmentRequest request) {
        // Get application
        Application application = getApplication(request.getApplicationId());

        // Get batch
        Batch batch = batchRepository.findById(request.getBatchId())
                .or(() -> batchRepository.findByBatchName(request.getBatchId()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Batch not found with ID: " + request.getBatchId()));

        // Validate batch is active
        if (batch.getStatus() != null && batch.getStatus() != BatchStatus.ACTIVE) {
            batch.setStatus(BatchStatus.ACTIVE);
            batchRepository.save(batch);
        }

        // Validate batch capacity
        if (!batchService.hasBatchCapacity(request.getBatchId())) {
            int available = batchService.getAvailableCapacity(request.getBatchId());
            throw new IllegalStateException(
                    "Batch is full. No available capacity. Available seats: " + available);
        }

        // Assign batch to application
        application.setAssignedBatchId(batch.getId());
        application.setAssignedBatchName(batch.getBatchName());
        application.setStatus(ApplicationStatus.BATCH_ASSIGNED);
        application.setUpdatedAt(LocalDateTime.now());

        Application savedApplication = applicationRepository.save(application);

        return applicationMapper.toResponse(savedApplication);
    }

    @Override
    public ApplicationResponse changeBatch(BatchAssignmentRequest request) {
        // Get application
        Application application = getApplication(request.getApplicationId());

        // Validate application has a batch assigned
        if (application.getAssignedBatchId() == null) {
            throw new IllegalStateException(
                    "Application does not have a batch assigned. Use assignBatch instead.");
        }

        // If trying to change to the same batch, return error
        if (application.getAssignedBatchId().equals(request.getBatchId())) {
            throw new IllegalStateException(
                    "New batch is the same as current batch. No change made.");
        }

        // Get new batch
        Batch newBatch = batchRepository.findById(request.getBatchId())
                .or(() -> batchRepository.findByBatchName(request.getBatchId()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Batch not found with ID: " + request.getBatchId()));

        // Validate new batch is active
        if (newBatch.getStatus() != BatchStatus.ACTIVE) {
            throw new IllegalStateException(
                    "New batch is not active. Current status: " + newBatch.getStatus());
        }

        // Validate new batch capacity
        if (!batchService.hasBatchCapacity(request.getBatchId())) {
            int available = batchService.getAvailableCapacity(request.getBatchId());
            throw new IllegalStateException(
                    "New batch is full. No available capacity. Available seats: " + available);
        }

        // Store old batch info for audit
        String oldBatchId = application.getAssignedBatchId();
        String oldBatchName = application.getAssignedBatchName();

        // Change batch
        application.setAssignedBatchId(newBatch.getId());
        application.setAssignedBatchName(newBatch.getBatchName());
        application.setUpdatedAt(LocalDateTime.now());

        Application savedApplication = applicationRepository.save(application);

        // Update student record if it exists
        Optional<Student> existingStudent = studentRepository.findByEmail(application.getEmail());
        if (existingStudent.isPresent()) {
            Student student = existingStudent.get();
            student.setBatchId(newBatch.getId());
            student.setBatchName(newBatch.getBatchName());
            student.setUpdatedAt(LocalDateTime.now());
            studentRepository.save(student);
        }

        // Send batch change notification email
        try {
            emailService.sendBatchChangeEmail(
                    application.getEmail(),
                    application.getFullName(),
                    oldBatchName,
                    newBatch.getBatchName(),
                    newBatch.getStartDate(),
                    newBatch.getCourseName(),
                    newBatch.getTechnicalTrainer() != null ? newBatch.getTechnicalTrainer().getFullName() : "TBD");
        } catch (Exception e) {
            System.err.println("Batch change email warning: " + e.getMessage());
        }

        return applicationMapper.toResponse(savedApplication);
    }

}