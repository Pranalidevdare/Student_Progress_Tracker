package com.example.SPT.service.Impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.SPT.dto.request.AddTrainerRequest;
import com.example.SPT.dto.request.CreateBatchRequest;
import com.example.SPT.dto.request.UpdateBatchRequest;
import com.example.SPT.dto.request.UpdateStudentRequest;
import com.example.SPT.dto.request.UpdateTrainerRequest;
import com.example.SPT.dto.response.AdminDashboardResponse;
import com.example.SPT.dto.response.BatchResponse;
import com.example.SPT.dto.response.StudentResponse;
import com.example.SPT.dto.response.UserResponse;
import com.example.SPT.entity.Batch;
import com.example.SPT.entity.User;
import com.example.SPT.enums.BatchStatus;
import com.example.SPT.enums.Role;
import com.example.SPT.enums.TrainerType;
import com.example.SPT.exception.DuplicateResourceException;
import com.example.SPT.exception.ResourceNotFoundException;
import com.example.SPT.repository.BatchRepository;
import com.example.SPT.repository.UserRepository;
import com.example.SPT.service.AdminService;


@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final BatchRepository batchRepository;
    private final PasswordEncoder passwordEncoder;
    

    public AdminServiceImpl(UserRepository userRepository,
            BatchRepository batchRepository,
            PasswordEncoder passwordEncoder) {

this.userRepository = userRepository;
this.batchRepository = batchRepository;
this.passwordEncoder = passwordEncoder;
}

    @Override
    public AdminDashboardResponse getDashboard() {

        return AdminDashboardResponse.builder()

                .totalStudents(
                        userRepository.countByRole(Role.STUDENT))

                .totalTechnicalTrainers(
                        userRepository.countByRoleAndTrainerType(
                                Role.TRAINER,
                                TrainerType.TECHNICAL))

                .totalSoftSkillTrainers(
                        userRepository.countByRoleAndTrainerType(
                                Role.TRAINER,
                                TrainerType.SOFT_SKILLS))

                .totalAdmins(
                        userRepository.countByRole(Role.ADMIN))

                .totalUsers(
                        userRepository.count())

                .totalBatches(
                        batchRepository.count())

                .activeBatches(
                        batchRepository.countByStatus(BatchStatus.ACTIVE))

                .completedBatches(
                        batchRepository.countByStatus(BatchStatus.COMPLETED))

                // These collections will be implemented later
                .pendingApplications(0)
                .shortlistedStudents(0)
                .technicalInterviewPending(0)
                .hrInterviewPending(0)
                .homeVisitPending(0)
                .documentsPending(0)
                .selectedStudents(0)
                .rejectedStudents(0)
                .todayAttendance(0)

                .build();
    }
    
    
    @Override
    public List<StudentResponse> getAllStudents() {

        List<User> students = userRepository.findByRole(Role.STUDENT);

        return students.stream()
                .map(this::mapStudentToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public StudentResponse getStudentById(String id) {

        User student = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Student not found"));

        if (student.getRole() != Role.STUDENT) {
            throw new ResourceNotFoundException("Student not found");
        }

        return mapStudentToResponse(student);
    }
    
    @Override
    public StudentResponse updateStudent(
            String id,
            UpdateStudentRequest request) {

        User student = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Student not found"));

        if (student.getRole() != Role.STUDENT) {
            throw new ResourceNotFoundException("Student not found");
        }
        
        
        if (!student.getEmail().equals(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {

            throw new RuntimeException("Email already exists");
        }
        
        
        if (!student.getPhone().equals(request.getPhone())
                && userRepository.existsByPhone(request.getPhone())) {

            throw new RuntimeException("Phone number already exists");
        }

        student.setFullName(request.getFullName());
        student.setEmail(request.getEmail());
        student.setPhone(request.getPhone());
        student.setEnabled(request.isEnabled());
        
        student.setUpdatedAt(LocalDateTime.now());

        userRepository.save(student);

        return mapStudentToResponse(student);
    }
    
    @Override
    public StudentResponse enableStudent(String id) {

        User student = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Student not found"));

        if (student.getRole() != Role.STUDENT) {
            throw new ResourceNotFoundException("Student not found");
        }

        student.setEnabled(true);
        student.setUpdatedAt(LocalDateTime.now());

        userRepository.save(student);

        return mapStudentToResponse(student);
    }
    
    @Override
    public StudentResponse disableStudent(String id) {

        User student = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Student not found"));

        if (student.getRole() != Role.STUDENT) {
            throw new ResourceNotFoundException("Student not found");
        }

        student.setEnabled(false);
        student.setUpdatedAt(LocalDateTime.now());

        userRepository.save(student);

        return mapStudentToResponse(student);
    }
    
    @Override
    public void deleteStudent(String id) {

        User student = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Student not found"));

        if (student.getRole() != Role.STUDENT) {
            throw new ResourceNotFoundException("Student not found");
        }

        userRepository.delete(student);
    }
    
    @Override
    public UserResponse addTrainer(AddTrainerRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Phone number already exists");
        }

        if (request.getTrainerType() == null) {
            throw new IllegalArgumentException("Trainer type is required");
        }

        User trainer = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.TRAINER)
                .trainerType(request.getTrainerType())
                .enabled(true)
                .build();

        trainer = userRepository.save(trainer);

        return UserResponse.builder()
                .id(trainer.getId())
                .fullName(trainer.getFullName())
                .email(trainer.getEmail())
                .phone(trainer.getPhone())
                .role(trainer.getRole())
                .trainerType(trainer.getTrainerType())
                .enabled(trainer.isEnabled())
                .build();
    }
    
    @Override
    public List<UserResponse> getAllTrainers() {

        List<User> trainers = userRepository.findByRole(Role.TRAINER);

        return trainers.stream()
                .map(trainer -> UserResponse.builder()
                        .id(trainer.getId())
                        .fullName(trainer.getFullName())
                        .email(trainer.getEmail())
                        .phone(trainer.getPhone())
                        .role(trainer.getRole())
                        .trainerType(trainer.getTrainerType())
                        .enabled(trainer.isEnabled())
                        .build())
                .toList();
    }
    
    private StudentResponse mapStudentToResponse(User student) {

        String fullName = student.getFullName();

        String firstName = "";
        String lastName = "";

        if (fullName != null && !fullName.trim().isEmpty()) {

            String[] nameParts = fullName.trim().split("\\s+", 2);

            firstName = nameParts[0];

            if (nameParts.length > 1) {
                lastName = nameParts[1];
            }
        }

        return StudentResponse.builder()
                .id(student.getId())
                .firstName(firstName)
                .lastName(lastName)
                .email(student.getEmail())
                .mobile(student.getPhone())
                .active(student.isEnabled())
                .build();
    }
    
    @Override
    public UserResponse getTrainerById(String id) {

        User trainer = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trainer not found"));

        if (trainer.getRole() != Role.TRAINER) {
            throw new ResourceNotFoundException("Trainer not found");
        }

        return UserResponse.builder()
                .id(trainer.getId())
                .fullName(trainer.getFullName())
                .email(trainer.getEmail())
                .phone(trainer.getPhone())
                .role(trainer.getRole())
                .trainerType(trainer.getTrainerType())
                .enabled(trainer.isEnabled())
                .build();
    }
    
    @Override
    public UserResponse updateTrainer(String id,
                                      UpdateTrainerRequest request) {

        User trainer = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trainer not found"));

        if (trainer.getRole() != Role.TRAINER) {
            throw new ResourceNotFoundException("Trainer not found");
        }

        
        if (!trainer.getEmail().equals(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {

            throw new DuplicateResourceException("Email already exists");
        }

        if (!trainer.getPhone().equals(request.getPhone())
                && userRepository.existsByPhone(request.getPhone())) {

            throw new DuplicateResourceException("Phone number already exists");
        }

        trainer.setFullName(request.getFullName());
        trainer.setEmail(request.getEmail());
        trainer.setPhone(request.getPhone());
        trainer.setTrainerType(request.getTrainerType());

        trainer = userRepository.save(trainer);

        return UserResponse.builder()
                .id(trainer.getId())
                .fullName(trainer.getFullName())
                .email(trainer.getEmail())
                .phone(trainer.getPhone())
                .role(trainer.getRole())
                .trainerType(trainer.getTrainerType())
                .enabled(trainer.isEnabled())
                .build();
    }
    
    
    @Override
    public UserResponse enableTrainer(String id) {

        User trainer = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trainer not found"));

        if (trainer.getRole() != Role.TRAINER) {
            throw new ResourceNotFoundException("Trainer not found");
        }

        trainer.setEnabled(true);
        trainer.setUpdatedAt(LocalDateTime.now());

        trainer = userRepository.save(trainer);

        return UserResponse.builder()
                .id(trainer.getId())
                .fullName(trainer.getFullName())
                .email(trainer.getEmail())
                .phone(trainer.getPhone())
                .role(trainer.getRole())
                .trainerType(trainer.getTrainerType())
                .enabled(trainer.isEnabled())
                .build();
    }
    
    @Override
    public UserResponse disableTrainer(String id) {

        User trainer = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trainer not found"));

        if (trainer.getRole() != Role.TRAINER) {
            throw new ResourceNotFoundException("Trainer not found");
        }

        trainer.setEnabled(false);
        trainer.setUpdatedAt(LocalDateTime.now());

        trainer = userRepository.save(trainer);

        return UserResponse.builder()
                .id(trainer.getId())
                .fullName(trainer.getFullName())
                .email(trainer.getEmail())
                .phone(trainer.getPhone())
                .role(trainer.getRole())
                .trainerType(trainer.getTrainerType())
                .enabled(trainer.isEnabled())
                .build();
    }
    
    @Override
    public void deleteTrainer(String id) {

        User trainer = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trainer not found"));

        if (trainer.getRole() != Role.TRAINER) {
            throw new ResourceNotFoundException("Trainer not found");
        }

        userRepository.delete(trainer);
    }
    
    private User getTrainerById(String id, TrainerType trainerType) {

        User trainer = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trainer not found"));

        if (trainer.getRole() != Role.TRAINER) {
            throw new ResourceNotFoundException("Trainer not found");
        }

        if (trainer.getTrainerType() != trainerType) {
            throw new IllegalArgumentException(
                    trainerType + " trainer expected.");
        }

        if (!trainer.isEnabled()) {
            throw new IllegalArgumentException(
                    "Trainer account is disabled.");
        }

        return trainer;
    }
    
    private BatchResponse mapToBatchResponse(Batch batch) {

        return BatchResponse.builder()
                .id(batch.getId())
                .batchName(batch.getBatchName())
                .courseName(batch.getCourseName())

                .technicalTrainerId(batch.getTechnicalTrainer().getId())
                .technicalTrainerName(batch.getTechnicalTrainer().getFullName())

                .softSkillsTrainerId(batch.getSoftSkillsTrainer().getId())
                .softSkillsTrainerName(batch.getSoftSkillsTrainer().getFullName())

                .startDate(batch.getStartDate())
                .endDate(batch.getEndDate())
                .capacity(batch.getCapacity())
                .status(batch.getStatus())
                .build();
    }
    
    @Override
    public BatchResponse createBatch(CreateBatchRequest request) {

        if (batchRepository.existsByBatchName(request.getBatchName())) {
            throw new DuplicateResourceException(
                    "Batch name already exists.");
        }

        if (request.getTechnicalTrainerId()
                .equals(request.getSoftSkillsTrainerId())) {

            throw new IllegalArgumentException(
                    "Technical and Soft Skills trainer cannot be the same.");
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException(
                    "End date must be after start date.");
        }

        User technicalTrainer = getTrainerById(
                request.getTechnicalTrainerId(),
                TrainerType.TECHNICAL);

        User softSkillsTrainer = getTrainerById(
                request.getSoftSkillsTrainerId(),
                TrainerType.SOFT_SKILLS);

        Batch batch = Batch.builder()
                .batchName(request.getBatchName())
                .courseName(request.getCourseName())
                .technicalTrainer(technicalTrainer)
                .softSkillsTrainer(softSkillsTrainer)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .capacity(request.getCapacity())
                .status(BatchStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Batch savedBatch = batchRepository.save(batch);

        return mapToBatchResponse(savedBatch);
    }
    
    @Override
    public Page<BatchResponse> getAllBatches(Pageable pageable) {

        return batchRepository.findAll(pageable)
                .map(this::mapToBatchResponse);
    }
    
    private Batch getBatch(String id) {

        return batchRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Batch not found"));
    }
    
    private void validateBatch(UpdateBatchRequest request,
            Batch existingBatch) {

if (!existingBatch.getBatchName().equalsIgnoreCase(request.getBatchName())
&& batchRepository.existsByBatchName(request.getBatchName())) {

throw new DuplicateResourceException(
 "Batch name already exists.");
}

if (request.getTechnicalTrainerId()
.equals(request.getSoftSkillsTrainerId())) {

throw new IllegalArgumentException(
 "Technical and Soft Skills trainer cannot be same.");
}

if (!request.getEndDate().isAfter(request.getStartDate())) {

throw new IllegalArgumentException(
 "End date must be after start date.");
}

if (request.getCapacity() <= 0) {

throw new IllegalArgumentException(
 "Capacity must be greater than zero.");
}
}
    
    @Override
    public BatchResponse getBatchById(String id) {

        Batch batch = getBatch(id);

        return mapToBatchResponse(batch);
    }
    
    @Override
    public BatchResponse updateBatch(String batchId,
                                     UpdateBatchRequest request) {

        Batch batch = getBatch(batchId);

        validateBatch(request, batch);

        User technicalTrainer = getTrainerById(
                request.getTechnicalTrainerId(),
                TrainerType.TECHNICAL);

        User softSkillsTrainer = getTrainerById(
                request.getSoftSkillsTrainerId(),
                TrainerType.SOFT_SKILLS);

        batch.setBatchName(request.getBatchName());
        batch.setCourseName(request.getCourseName());
        batch.setTechnicalTrainer(technicalTrainer);
        batch.setSoftSkillsTrainer(softSkillsTrainer);
        batch.setStartDate(request.getStartDate());
        batch.setEndDate(request.getEndDate());
        batch.setCapacity(request.getCapacity());
        batch.setStatus(request.getStatus());
        batch.setUpdatedAt(LocalDateTime.now());

        Batch updatedBatch = batchRepository.save(batch);

        return mapToBatchResponse(updatedBatch);
    }
    
    @Override
    public void deactivateBatch(String id) {

        Batch batch = getBatch(id);

        if (batch.getStatus() == BatchStatus.COMPLETED) {
            throw new IllegalArgumentException(
                    "Completed batch cannot be deactivated.");
        }

        batch.setStatus(BatchStatus.INACTIVE);
        batch.setUpdatedAt(LocalDateTime.now());

        batchRepository.save(batch);
    }
}
