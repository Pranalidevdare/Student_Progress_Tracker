package com.example.SPT.service;

import java.util.List;

import com.example.SPT.dto.request.MaterialRequest;
import com.example.SPT.dto.response.MaterialResponse;

public interface StudyMaterialService {

    MaterialResponse uploadMaterial(MaterialRequest request);

    MaterialResponse updateMaterial(String id, MaterialRequest request);

    void deleteMaterial(String id);

    List<MaterialResponse> getMaterialsByBatch(String batchId);

}