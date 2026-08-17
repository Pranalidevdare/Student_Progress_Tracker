package com.example.SPT.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.response.MaterialResponse;
import com.example.SPT.service.StudyMaterialService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student/materials")
@RequiredArgsConstructor
@CrossOrigin("*")
public class StudentMaterialController {

    private final StudyMaterialService studyMaterialService;

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<MaterialResponse>> getMaterials(
            @PathVariable String batchId) {

        return ResponseEntity.ok(
                studyMaterialService.getMaterialsByBatch(batchId));
    }

}