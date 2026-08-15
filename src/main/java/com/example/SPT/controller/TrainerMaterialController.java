package com.example.SPT.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.request.MaterialRequest;
import com.example.SPT.dto.response.MaterialResponse;
import com.example.SPT.service.StudyMaterialService;
import com.example.SPT.service.Impl.StudyMaterialServiceImpl;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trainer/materials")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TrainerMaterialController {

    private final StudyMaterialService studyMaterialService;

    @PostMapping(consumes = {org.springframework.http.MediaType.APPLICATION_JSON_VALUE, org.springframework.http.MediaType.ALL_VALUE})
    public ResponseEntity<MaterialResponse> uploadMaterial(
            @RequestBody MaterialRequest request,
            Authentication authentication) {

        String trainerEmail = (authentication != null) ? authentication.getName() : null;
        return new ResponseEntity<>(studyMaterialService.uploadMaterial(request, trainerEmail), HttpStatus.CREATED);
    }

    @PostMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MaterialResponse> uploadMaterialMultipart(
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "materialType", required = false) String materialType,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "batchId", required = false) String batchId,
            @RequestParam(value = "fileName", required = false) String fileName,
            @RequestParam(value = "fileUrl", required = false) String fileUrl,
            Authentication authentication) {

        String trainerEmail = (authentication != null) ? authentication.getName() : null;
        MaterialRequest request = MaterialRequest.builder()
                .title(title)
                .subject(subject)
                .materialType(materialType)
                .description(description)
                .batchId(batchId)
                .fileName(fileName)
                .fileUrl(fileUrl)
                .build();

        return new ResponseEntity<>(studyMaterialService.uploadMaterialMultipart(request, file, trainerEmail), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaterialResponse> updateMaterial(
            @PathVariable String id,
            @Valid @RequestBody MaterialRequest request,
            Authentication authentication) {

        String trainerEmail = (authentication != null) ? authentication.getName() : null;
        if (studyMaterialService instanceof StudyMaterialServiceImpl impl) {
            return ResponseEntity.ok(impl.updateMaterial(id, request, trainerEmail));
        }
        return ResponseEntity.ok(studyMaterialService.updateMaterial(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMaterial(@PathVariable String id) {
        studyMaterialService.deleteMaterial(id);
        return ResponseEntity.ok("Study Material deleted successfully.");
    }

    @GetMapping
    public ResponseEntity<List<MaterialResponse>> getTrainerMaterials(
            @RequestParam(required = false) String batchId,
            Authentication authentication) {

        String trainerEmail = (authentication != null) ? authentication.getName() : null;
        return ResponseEntity.ok(studyMaterialService.getMaterialsForTrainer(batchId, trainerEmail));
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<MaterialResponse>> getMaterials(
            @PathVariable String batchId,
            Authentication authentication) {

        String trainerEmail = (authentication != null) ? authentication.getName() : null;
        return ResponseEntity.ok(studyMaterialService.getMaterialsForTrainer(batchId, trainerEmail));
    }
}