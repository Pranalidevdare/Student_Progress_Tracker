package com.example.SPT.mapper;

import org.springframework.stereotype.Component;

import com.example.SPT.dto.request.TrainerRequest;
import com.example.SPT.dto.response.TrainerResponse;
import com.example.SPT.entity.Trainer;

@Component
public class TrainerMapper {

    public Trainer toEntity(TrainerRequest request) {

        if (request == null) {
            return null;
        }

        return Trainer.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .mobile(request.getMobile())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .employeeId(request.getEmployeeId())
                .specialization(request.getSpecialization())
                .qualification(request.getQualification())
                .experience(request.getExperience())
                .batchId(request.getBatchId())
                .profileImage(request.getProfileImage())
                .build();
    }

    public TrainerResponse toResponse(Trainer trainer) {

        if (trainer == null) {
            return null;
        }

        return TrainerResponse.builder()
                .id(trainer.getId())
                .firstName(trainer.getFirstName())
                .lastName(trainer.getLastName())
                .email(trainer.getEmail())
                .mobile(trainer.getMobile())
                .dateOfBirth(trainer.getDateOfBirth())
                .gender(trainer.getGender())
                .employeeId(trainer.getEmployeeId())
                .specialization(trainer.getSpecialization())
                .qualification(trainer.getQualification())
                .experience(trainer.getExperience())
                .batchId(trainer.getBatchId())
                .profileImage(trainer.getProfileImage())
                .active(trainer.getActive())
                .build();
    }

}