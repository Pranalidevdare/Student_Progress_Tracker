package com.finalproject.studentprogresstracker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.entity.StudyMaterial;
import com.finalproject.studentprogresstracker.service.StudyMaterialService;

@RestController
@RequestMapping("/api/study-material")
@CrossOrigin(origins = "*")
public class StudyMaterialController {

    @Autowired
    private StudyMaterialService studyMaterialService;

    // Upload Study Material
    @PostMapping("/add")
    public ResponseEntity<StudyMaterial> uploadMaterial(
            @RequestBody StudyMaterial studyMaterial) {

        return new ResponseEntity<>(
                studyMaterialService.uploadMaterial(studyMaterial),
                HttpStatus.CREATED);
    }

    // Get All Study Materials
    @GetMapping("/all")
    public ResponseEntity<List<StudyMaterial>> getAllMaterials() {

        return ResponseEntity.ok(
                studyMaterialService.getAllMaterials());
    }

    // Get Study Material By Id
    @GetMapping("/{materialId}")
    public ResponseEntity<StudyMaterial> getMaterialById(
            @PathVariable String materialId) {

        return ResponseEntity.ok(
                studyMaterialService.getMaterialById(materialId));
    }

    // Get Materials By Trainer
    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<List<StudyMaterial>> getMaterialsByTrainer(
            @PathVariable String trainerId) {

        return ResponseEntity.ok(
                studyMaterialService.getMaterialsByTrainer(trainerId));
    }

    // Get Materials By Subject
    @GetMapping("/subject/{subject}")
    public ResponseEntity<List<StudyMaterial>> getMaterialsBySubject(
            @PathVariable String subject) {

        return ResponseEntity.ok(
                studyMaterialService.getMaterialsBySubject(subject));
    }

    // Update Study Material
    @PutMapping("/update/{materialId}")
    public ResponseEntity<StudyMaterial> updateMaterial(
            @PathVariable String materialId,
            @RequestBody StudyMaterial studyMaterial) {

        return ResponseEntity.ok(
                studyMaterialService.updateMaterial(materialId, studyMaterial));
    }

    // Delete Study Material
    @DeleteMapping("/delete/{materialId}")
    public ResponseEntity<String> deleteMaterial(
            @PathVariable String materialId) {

        return ResponseEntity.ok(
                studyMaterialService.deleteMaterial(materialId));
    }

}