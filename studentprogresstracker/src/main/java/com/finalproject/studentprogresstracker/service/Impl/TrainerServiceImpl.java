package com.finalproject.studentprogresstracker.service.Impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.finalproject.studentprogresstracker.dto.request.TrainerRequest;
import com.finalproject.studentprogresstracker.dto.response.TrainerDashboardResponse;
import com.finalproject.studentprogresstracker.dto.response.TrainerResponse;
import com.finalproject.studentprogresstracker.entity.Trainer;
import com.finalproject.studentprogresstracker.mapper.TrainerMapper;
import com.finalproject.studentprogresstracker.repository.TrainerRepository;
import com.finalproject.studentprogresstracker.service.TrainerService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TrainerServiceImpl implements TrainerService {

    private final TrainerRepository trainerRepository;

    private final TrainerMapper trainerMapper;

    @Override
    public TrainerResponse registerTrainer(TrainerRequest request) {

        if (trainerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException(
                    "Trainer already exists with email : " + request.getEmail());
        }

        Trainer trainer = trainerMapper.toEntity(request);

        trainer.setActive(true);
        trainer.setCreatedAt(LocalDateTime.now());
        trainer.setUpdatedAt(LocalDateTime.now());

        Trainer savedTrainer = trainerRepository.save(trainer);

        return trainerMapper.toResponse(savedTrainer);
    }

    @Override
    public TrainerResponse getTrainerById(String id) {

        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Trainer not found with id : " + id));

        return trainerMapper.toResponse(trainer);
    }

    @Override
    public List<TrainerResponse> getAllTrainers() {

        return trainerRepository.findAll()
                .stream()
                .map(trainerMapper::toResponse)
                .collect(Collectors.toList());
    }
    @Override
    public TrainerResponse updateTrainer(String id, TrainerRequest request) {

        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Trainer not found with id : " + id));

        trainer.setFirstName(request.getFirstName());
        trainer.setLastName(request.getLastName());
        trainer.setEmail(request.getEmail());
        trainer.setMobile(request.getMobile());
        trainer.setDateOfBirth(request.getDateOfBirth());
        trainer.setGender(request.getGender());
        trainer.setEmployeeId(request.getEmployeeId());
        trainer.setSpecialization(request.getSpecialization());
        trainer.setQualification(request.getQualification());
        trainer.setExperience(request.getExperience());
        trainer.setBatchId(request.getBatchId());
        trainer.setProfileImage(request.getProfileImage());

        trainer.setUpdatedAt(LocalDateTime.now());

        Trainer updatedTrainer = trainerRepository.save(trainer);

        return trainerMapper.toResponse(updatedTrainer);
    }

    @Override
    public void deleteTrainer(String id) {

        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Trainer not found with id : " + id));

        trainerRepository.delete(trainer);
    }

    @Override
    public TrainerDashboardResponse getTrainerDashboard(String trainerId) {

        Trainer trainer = trainerRepository.findById(trainerId)
                .orElseThrow(() ->
                        new RuntimeException("Trainer not found with id : " + trainerId));

        TrainerResponse trainerResponse = trainerMapper.toResponse(trainer);

        TrainerDashboardResponse dashboard = TrainerDashboardResponse.builder()
                .trainer(trainerResponse)

                // Default values (replace later using repositories)
                .totalStudents(0)
                .totalAssignments(0)
                .totalAssessments(0)
                .totalStudyMaterials(0)
                .totalInterviews(0)
                .attendanceMarkedToday(0)

                .build();

        return dashboard;
    }

}