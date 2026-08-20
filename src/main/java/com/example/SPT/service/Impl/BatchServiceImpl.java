package com.example.SPT.service.Impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.SPT.dto.request.CreateBatchRequest;
import com.example.SPT.dto.response.BatchResponse;
import com.example.SPT.dto.response.StudentResponse;
import com.example.SPT.entity.Application;
import com.example.SPT.entity.Batch;
import com.example.SPT.entity.SelectionStatus;
import com.example.SPT.entity.Student;
import com.example.SPT.entity.User;
import com.example.SPT.enums.ApplicationStatus;
import com.example.SPT.enums.BatchStatus;
import com.example.SPT.enums.Role;
import com.example.SPT.enums.TrainerType;
import com.example.SPT.exception.DuplicateResourceException;
import com.example.SPT.exception.ResourceNotFoundException;
import com.example.SPT.mapper.BatchMapper;
import com.example.SPT.mapper.StudentMapper;
import com.example.SPT.repository.ApplicationRepository;
import com.example.SPT.repository.BatchRepository;
import com.example.SPT.repository.StudentRepository;
import com.example.SPT.repository.UserRepository;
import com.example.SPT.service.BatchService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class BatchServiceImpl implements BatchService {

    private final BatchRepository batchRepository;
    private final StudentRepository studentRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final BatchMapper batchMapper;
    private final StudentMapper studentMapper;

    @Override
    public BatchResponse createBatch(CreateBatchRequest request) {
        String batchName = request.getBatchName() != null ? request.getBatchName().trim() : "";
        if (batchName.isEmpty()) {
            throw new IllegalArgumentException("Batch name is required.");
        }

        if (batchRepository.existsByBatchName(batchName)) {
            throw new DuplicateResourceException("Batch name '" + batchName + "' already exists.");
        }

        if (request.getTechnicalTrainerId().equals(request.getSoftSkillsTrainerId())) {
            throw new IllegalArgumentException("Technical Trainer and Soft Skills Trainer cannot be the same person.");
        }

        User technicalTrainer = userRepository.findById(request.getTechnicalTrainerId())
                .orElseThrow(() -> new ResourceNotFoundException("Technical Trainer not found with ID: " + request.getTechnicalTrainerId()));

        User softSkillsTrainer = userRepository.findById(request.getSoftSkillsTrainerId())
                .orElseThrow(() -> new ResourceNotFoundException("Soft Skills Trainer not found with ID: " + request.getSoftSkillsTrainerId()));

        int capacity = request.getCapacity() != null ? request.getCapacity() : 30;
        if (capacity <= 0) {
            throw new IllegalArgumentException("Batch capacity must be greater than 0.");
        }

        List<String> appIds = request.getApplicationIds() != null ? request.getApplicationIds() : new ArrayList<>();
        if (appIds.isEmpty()) {
            throw new IllegalArgumentException("Please select at least one selected applicant to assign to this batch.");
        }

        if (appIds.size() > capacity) {
            throw new IllegalArgumentException("Batch capacity cannot be less than the number of selected students (" + appIds.size() + ").");
        }

        // Validate all applications are in SELECTED status
        List<Application> selectedApplications = new ArrayList<>();
        for (String appId : appIds) {
            Application app = applicationRepository.findById(appId.trim())
                    .or(() -> applicationRepository.findByApplicationNumber(appId.trim()))
                    .orElseThrow(() -> new ResourceNotFoundException("Candidate Application not found with ID: " + appId));

            if (app.getStatus() != ApplicationStatus.SELECTED && app.getStatus() != ApplicationStatus.BATCH_ASSIGNED) {
                throw new IllegalArgumentException("Application " + app.getApplicationNumber() + " (" + app.getFullName() + ") is not in SELECTED status. Current status: " + app.getStatus());
            }
            selectedApplications.add(app);
        }

        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();
        LocalDate endDate = request.getEndDate() != null ? request.getEndDate() : startDate.plusMonths(6);

        // Create and save Batch
        Batch batch = Batch.builder()
                .batchName(batchName)
                .courseName(request.getCourseName())
                .technicalTrainer(technicalTrainer)
                .softSkillsTrainer(softSkillsTrainer)
                .startDate(startDate)
                .endDate(endDate)
                .capacity(capacity)
                .status(BatchStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Batch savedBatch = batchRepository.save(batch);

        // Associate applications and create/update student records
        for (Application app : selectedApplications) {
            app.setAssignedBatchId(savedBatch.getId());
            app.setAssignedBatchName(savedBatch.getBatchName());
            app.setStatus(ApplicationStatus.BATCH_ASSIGNED);
            app.setUpdatedAt(LocalDateTime.now());
            applicationRepository.save(app);

            // Sync with Student entity
            Optional<Student> existingStudent = studentRepository.findByEmail(app.getEmail());
            Student student = existingStudent.orElseGet(() -> Student.builder()
                    .email(app.getEmail())
                    .studentId(app.getApplicationNumber() != null ? app.getApplicationNumber() : "STU" + System.currentTimeMillis())
                    .firstName(app.getFullName() != null && app.getFullName().contains(" ") ? app.getFullName().substring(0, app.getFullName().indexOf(" ")).trim() : app.getFullName())
                    .lastName(app.getFullName() != null && app.getFullName().contains(" ") ? app.getFullName().substring(app.getFullName().indexOf(" ") + 1).trim() : "")
                    .mobile(app.getMobile())
                    .collegeName(app.getCollegeName())
                    .branch(app.getBranch())
                    .active(true)
                    .selectionStatus(SelectionStatus.SELECTED)
                    .createdAt(LocalDateTime.now())
                    .build());

            student.setBatchId(savedBatch.getId());
            student.setBatchName(savedBatch.getBatchName());
            student.setUpdatedAt(LocalDateTime.now());
            studentRepository.save(student);
        }

        return enrichBatchWithEnrollment(savedBatch);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BatchResponse> getAllBatches() {
        List<Batch> batches = batchRepository.findAll();
        return batches.stream()
                .map(this::enrichBatchWithEnrollment)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BatchResponse> getActiveBatches() {
        List<Batch> batches = batchRepository.findByStatus(BatchStatus.ACTIVE);
        return batches.stream()
                .map(this::enrichBatchWithEnrollment)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BatchResponse getBatchById(String batchId) {
        Batch batch = batchRepository.findById(batchId)
                .or(() -> batchRepository.findByBatchName(batchId))
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with ID: " + batchId));
        return enrichBatchWithEnrollment(batch);
    }

    @Override
    @Transactional(readOnly = true)
    public BatchResponse getBatchByName(String batchName) {
        Batch batch = batchRepository.findByBatchName(batchName)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with name: " + batchName));
        return enrichBatchWithEnrollment(batch);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BatchResponse> getBatchesByTrainer(String trainerId) {
        if (trainerId == null || trainerId.isBlank()) {
            return new ArrayList<>();
        }

        // Try direct trainer ID or look up user by email
        final String searchId = trainerId.trim();
        Optional<User> userOpt = userRepository.findById(searchId)
                .or(() -> userRepository.findByEmail(searchId));
        String resolvedTrainerId = userOpt.map(User::getId).orElse(searchId);

        List<Batch> technicalBatches = batchRepository.findByTechnicalTrainer_Id(resolvedTrainerId);
        List<Batch> softSkillsBatches = batchRepository.findBySoftSkillsTrainer_Id(resolvedTrainerId);

        Set<String> processedBatchIds = new HashSet<>();
        List<BatchResponse> result = new ArrayList<>();

        for (Batch b : technicalBatches) {
            if (processedBatchIds.add(b.getId())) {
                BatchResponse res = enrichBatchWithEnrollment(b);
                res.setTrainerRole("Technical Trainer");
                result.add(res);
            }
        }

        for (Batch b : softSkillsBatches) {
            if (processedBatchIds.add(b.getId())) {
                BatchResponse res = enrichBatchWithEnrollment(b);
                res.setTrainerRole("Soft Skills Trainer");
                result.add(res);
            }
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponse> getStudentsInBatch(String batchId) {
        if (batchId == null || batchId.isBlank()) {
            return new ArrayList<>();
        }

        // Find batch to verify existence
        Batch batch = batchRepository.findById(batchId.trim())
                .or(() -> batchRepository.findByBatchName(batchId.trim()))
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with ID: " + batchId));

        List<Student> students = studentRepository.findByBatchId(batch.getId());
        if (students.isEmpty() && batch.getBatchName() != null) {
            students = studentRepository.findByBatchId(batch.getBatchName());
        }

        List<StudentResponse> studentResponses = students.stream()
                .map(studentMapper::toResponse)
                .collect(Collectors.toList());

        // Fallback: if no students collection records yet, check applications assigned to this batch
        if (studentResponses.isEmpty()) {
            List<Application> assignedApps = applicationRepository.findAll().stream()
                    .filter(a -> batch.getId().equals(a.getAssignedBatchId()) || (batch.getBatchName() != null && batch.getBatchName().equalsIgnoreCase(a.getAssignedBatchName())))
                    .toList();

            for (Application app : assignedApps) {
                String fullName = app.getFullName() != null ? app.getFullName() : "Candidate";
                String firstName = fullName.contains(" ") ? fullName.substring(0, fullName.indexOf(" ")).trim() : fullName;
                String lastName = fullName.contains(" ") ? fullName.substring(fullName.indexOf(" ") + 1).trim() : "";

                studentResponses.add(StudentResponse.builder()
                        .id(app.getId())
                        .studentId(app.getApplicationNumber() != null ? app.getApplicationNumber() : app.getId())
                        .firstName(firstName)
                        .lastName(lastName)
                        .email(app.getEmail())
                        .mobile(app.getMobile())
                        .collegeName(app.getCollegeName())
                        .branch(app.getBranch())
                        .batchId(batch.getId())
                        .active(true)
                        .build());
            }
        }

        return studentResponses;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BatchResponse> getBatchesByStatus(BatchStatus status) {
        List<Batch> batches = batchRepository.findByStatus(status);
        return batches.stream()
                .map(this::enrichBatchWithEnrollment)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BatchResponse> getBatchesByCourse(String courseName) {
        List<Batch> batches = batchRepository.findByCourseNameIgnoreCase(courseName);
        return batches.stream()
                .map(this::enrichBatchWithEnrollment)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasBatchCapacity(String batchId) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with ID: " + batchId));
        
        long enrolledCount = studentRepository.countByBatchId(batchId);
        int cap = batch.getCapacity() != null ? batch.getCapacity() : 30;
        return enrolledCount < cap;
    }

    @Override
    @Transactional(readOnly = true)
    public int getAvailableCapacity(String batchId) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with ID: " + batchId));
        
        long enrolledCount = studentRepository.countByBatchId(batchId);
        int cap = batch.getCapacity() != null ? batch.getCapacity() : 30;
        return Math.max(0, cap - (int) enrolledCount);
    }

    @Override
    @Transactional(readOnly = true)
    public int getEnrolledCount(String batchId) {
        return (int) studentRepository.countByBatchId(batchId);
    }

    /**
     * Helper method to enrich batch response with enrollment information
     */
    private BatchResponse enrichBatchWithEnrollment(Batch batch) {
        long enrolledCount = studentRepository.countByBatchId(batch.getId());
        if (enrolledCount == 0 && batch.getBatchName() != null) {
            enrolledCount = studentRepository.countByBatchId(batch.getBatchName());
        }
        if (enrolledCount == 0) {
            // Also count from assigned applications
            enrolledCount = applicationRepository.findAll().stream()
                    .filter(a -> batch.getId().equals(a.getAssignedBatchId()) || (batch.getBatchName() != null && batch.getBatchName().equalsIgnoreCase(a.getAssignedBatchName())))
                    .count();
        }

        int capacity = batch.getCapacity() != null ? batch.getCapacity() : 30;
        int availableSeats = Math.max(0, capacity - (int) enrolledCount);

        BatchResponse response = batchMapper.toResponse(batch);
        response.setEnrolledCount((int) enrolledCount);
        response.setAvailableSeats(availableSeats);

        return response;
    }

}
