package com.finalproject.studentprogresstracker.service;

import java.util.List;

import com.finalproject.studentprogresstracker.dto.request.MaterialRequest;
import com.finalproject.studentprogresstracker.dto.response.MaterialResponse;

public interface StudyMaterialService {

    MaterialResponse uploadMaterial(MaterialRequest request);

    MaterialResponse updateMaterial(String id, MaterialRequest request);

    void deleteMaterial(String id);

    List<MaterialResponse> getMaterialsByBatch(String batchId);

}