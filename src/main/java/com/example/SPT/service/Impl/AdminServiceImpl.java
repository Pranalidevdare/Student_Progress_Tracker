package com.example.SPT.service.Impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.SPT.dto.request.AddTrainerRequest;
import com.example.SPT.dto.request.UpdateStudentRequest;
import com.example.SPT.dto.request.UpdateTrainerRequest;
import com.example.SPT.dto.response.AdminDashboardResponse;
import com.example.SPT.dto.response.StudentResponse;
import com.example.SPT.dto.response.UserResponse;
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

                .map(student -> StudentResponse.builder()

                        .id(student.getId())

                        .fullName(student.getFullName())

                        .email(student.getEmail())

                        .phone(student.getPhone())

                        .role(student.getRole())

                        .enabled(student.isEnabled())

                        .build())

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

        return StudentResponse.builder()
                .id(student.getId())
                .fullName(student.getFullName())
                .email(student.getEmail())
                .phone(student.getPhone())
                .role(student.getRole())
                .enabled(student.isEnabled())
                .build();
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

        return StudentResponse.builder()
                .id(student.getId())
                .fullName(student.getFullName())
                .email(student.getEmail())
                .phone(student.getPhone())
                .role(student.getRole())
                .enabled(student.isEnabled())
                .build();
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

        return StudentResponse.builder()
                .id(student.getId())
                .fullName(student.getFullName())
                .email(student.getEmail())
                .phone(student.getPhone())
                .role(student.getRole())
                .enabled(student.isEnabled())
                .build();
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

        return StudentResponse.builder()
                .id(student.getId())
                .fullName(student.getFullName())
                .email(student.getEmail())
                .phone(student.getPhone())
                .role(student.getRole())
                .enabled(student.isEnabled())
                .build();
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

        // Email duplicate check
        if (!trainer.getEmail().equals(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {

            throw new DuplicateResourceException("Email already exists");
        }

        // Phone duplicate check
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
}
