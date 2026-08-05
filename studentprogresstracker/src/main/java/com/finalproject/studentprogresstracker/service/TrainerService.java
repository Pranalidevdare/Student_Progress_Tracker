package com.finalproject.studentprogresstracker.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.finalproject.studentprogresstracker.entity.Trainer;
import com.finalproject.studentprogresstracker.exception.TrainerNotFoundException;
import com.finalproject.studentprogresstracker.repository.TrainerRepository;

@Service
public class TrainerService {

    @Autowired
    private TrainerRepository trainerRepository;

    // Add Trainer
    public Trainer addTrainer(Trainer trainer) {

        if (trainerRepository.existsByEmail(trainer.getEmail())) {
            throw new RuntimeException("Trainer already exists with email : " + trainer.getEmail());
        }

        trainer.setStatus("ACTIVE");

        return trainerRepository.save(trainer);
    }

    // Get All Trainers
    public List<Trainer> getAllTrainer() {

        return trainerRepository.findAll();
    }

    // Get Trainer By Id
    public Trainer getTrainerById(String trainerId) {

        return trainerRepository.findById(trainerId)
                .orElseThrow(() ->
                        new TrainerNotFoundException(
                                "Trainer not found with id : " + trainerId));
    }

    // Update Trainer
    public Trainer updateTrainer(String trainerId, Trainer trainer) {

        Trainer existingTrainer = trainerRepository.findById(trainerId)
                .orElseThrow(() ->
                        new TrainerNotFoundException(
                                "Trainer not found with id : " + trainerId));

        existingTrainer.setTrainerName(trainer.getTrainerName());
        existingTrainer.setEmail(trainer.getEmail());
        existingTrainer.setMobileNumber(trainer.getMobileNumber());
        existingTrainer.setDepartment(trainer.getDepartment());
        existingTrainer.setSpecialization(trainer.getSpecialization());
        existingTrainer.setExperience(trainer.getExperience());
        existingTrainer.setQualification(trainer.getQualification());
        existingTrainer.setJoiningDate(trainer.getJoiningDate());
        existingTrainer.setStatus(trainer.getStatus());

        return trainerRepository.save(existingTrainer);
    }

    // Delete Trainer
    public String deleteTrainer(String trainerId) {

        Trainer trainer = trainerRepository.findById(trainerId)
                .orElseThrow(() ->
                        new TrainerNotFoundException(
                                "Trainer not found with id : " + trainerId));

        trainerRepository.delete(trainer);

        return "Trainer Deleted Successfully";
    }

    // Search By Email
    public Trainer getTrainerByEmail(String email) {

        return trainerRepository.findByEmail(email)
                .orElseThrow(() ->
                        new TrainerNotFoundException(
                                "Trainer not found with email : " + email));
    }

    // Search By Name
    public Trainer getTrainerByName(String trainerName) {

        return trainerRepository.findByTrainerName(trainerName)
                .orElseThrow(() ->
                        new TrainerNotFoundException(
                                "Trainer not found with name : " + trainerName));
    }

    // Activate Trainer
    public Trainer activateTrainer(String trainerId) {

        Trainer trainer = getTrainerById(trainerId);

        trainer.setStatus("ACTIVE");

        return trainerRepository.save(trainer);
    }

    // Deactivate Trainer
    public Trainer deactivateTrainer(String trainerId) {

        Trainer trainer = getTrainerById(trainerId);

        trainer.setStatus("INACTIVE");

        return trainerRepository.save(trainer);
    }

}