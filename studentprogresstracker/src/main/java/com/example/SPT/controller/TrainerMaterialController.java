package com.example.SPT.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.request.MaterialRequest;
import com.example.SPT.dto.response.MaterialResponse;
import com.example.SPT.service.StudyMaterialService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trainer/materials")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TrainerMaterialController {

    private final StudyMaterialService studyMaterialService;

    @PostMapping
    public ResponseEntity<MaterialResponse> uploadMaterial(
            @Valid @RequestBody MaterialRequest request) {

        return new ResponseEntity<>(
                studyMaterialService.uploadMaterial(request),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaterialResponse> updateMaterial(
            @PathVariable String id,
            @Valid @RequestBody MaterialRequest request) {

        return ResponseEntity.ok(
                studyMaterialService.updateMaterial(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMaterial(
            @PathVariable String id) {

        studyMaterialService.deleteMaterial(id);

        return ResponseEntity.ok("Study Material deleted successfully.");
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<MaterialResponse>> getMaterials(
            @PathVariable String batchId) {

        return ResponseEntity.ok(
                studyMaterialService.getMaterialsByBatch(batchId));
    }

}