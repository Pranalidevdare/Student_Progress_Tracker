package com.example.SPT.service;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;

import com.example.SPT.dto.request.MaterialRequest;
import com.example.SPT.dto.response.MaterialResponse;

public interface StudyMaterialService {

    MaterialResponse uploadMaterial(MaterialRequest request);

    MaterialResponse uploadMaterial(MaterialRequest request, String trainerEmail);

    MaterialResponse uploadMaterialMultipart(MaterialRequest request, MultipartFile file, String trainerEmail);

    MaterialResponse updateMaterial(String id, MaterialRequest request);

    MaterialResponse updateMaterial(String id, MaterialRequest request, String trainerEmail);

    void deleteMaterial(String id);

    List<MaterialResponse> getMaterialsByBatch(String batchId);

    List<MaterialResponse> getMaterialsForTrainer(String batchId, String trainerEmail);

}