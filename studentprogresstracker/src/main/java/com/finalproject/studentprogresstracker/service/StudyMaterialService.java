package com.finalproject.studentprogresstracker.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.finalproject.studentprogresstracker.entity.StudyMaterial;
import com.finalproject.studentprogresstracker.repository.StudyMaterialRepository;

@Service
public class StudyMaterialService {

    @Autowired
    private StudyMaterialRepository studyMaterialRepository;

    // Upload Study Material
    public StudyMaterial uploadMaterial(StudyMaterial studyMaterial) {

        studyMaterial.setUploadDate(LocalDate.now());

        return studyMaterialRepository.save(studyMaterial);
    }

    // Get All Study Materials
    public List<StudyMaterial> getAllMaterials() {

        return studyMaterialRepository.findAll();
    }

    // Get Study Material By Id
    public StudyMaterial getMaterialById(String materialId) {

        return studyMaterialRepository.findById(materialId)
                .orElseThrow(() ->
                        new RuntimeException("Study Material Not Found"));
    }

    // Get Materials By Trainer
    public List<StudyMaterial> getMaterialsByTrainer(String trainerId) {

        return studyMaterialRepository.findByTrainerId(trainerId);
    }

    // Get Materials By Subject
    public List<StudyMaterial> getMaterialsBySubject(String subject) {

        return studyMaterialRepository.findBySubject(subject);
    }

    // Update Study Material
    public StudyMaterial updateMaterial(String materialId,
                                        StudyMaterial studyMaterial) {

        StudyMaterial existingMaterial =
                studyMaterialRepository.findById(materialId)
                        .orElseThrow(() ->
                                new RuntimeException("Study Material Not Found"));

        existingMaterial.setTitle(studyMaterial.getTitle());
        existingMaterial.setSubject(studyMaterial.getSubject());
        existingMaterial.setDescription(studyMaterial.getDescription());
        existingMaterial.setFileUrl(studyMaterial.getFileUrl());
        existingMaterial.setTrainerId(studyMaterial.getTrainerId());

        return studyMaterialRepository.save(existingMaterial);
    }

    // Delete Study Material
    public String deleteMaterial(String materialId) {

        StudyMaterial material =
                studyMaterialRepository.findById(materialId)
                        .orElseThrow(() ->
                                new RuntimeException("Study Material Not Found"));

        studyMaterialRepository.delete(material);

        return "Study Material Deleted Successfully";
    }

}