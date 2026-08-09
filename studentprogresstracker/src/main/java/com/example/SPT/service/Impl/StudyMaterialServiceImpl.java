package com.example.SPT.service.Impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.SPT.dto.request.MaterialRequest;
import com.example.SPT.dto.response.MaterialResponse;
import com.example.SPT.entity.StudyMaterial;
import com.example.SPT.mapper.MaterialMapper;
import com.example.SPT.repository.StudyMaterialRepository;
import com.example.SPT.service.StudyMaterialService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudyMaterialServiceImpl implements StudyMaterialService {

    private final StudyMaterialRepository studyMaterialRepository;

    private final MaterialMapper materialMapper;

    @Override
    public MaterialResponse uploadMaterial(MaterialRequest request) {

        StudyMaterial material = StudyMaterial.builder()
                .trainerId(request.getTrainerId())
                .batchId(request.getBatchId())
                .title(request.getTitle())
                .description(request.getDescription())
                .subject(request.getSubject())
                .materialType(request.getMaterialType())
                .fileName(request.getFileName())
                .fileUrl(request.getFileUrl())
                .uploadedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        StudyMaterial savedMaterial = studyMaterialRepository.save(material);

        return materialMapper.toResponse(savedMaterial);
    }

    @Override
    public MaterialResponse updateMaterial(String id, MaterialRequest request) {

        StudyMaterial material = studyMaterialRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Study Material not found with id : " + id));

        material.setTrainerId(request.getTrainerId());
        material.setBatchId(request.getBatchId());
        material.setTitle(request.getTitle());
        material.setDescription(request.getDescription());
        material.setSubject(request.getSubject());
        material.setMaterialType(request.getMaterialType());
        material.setFileName(request.getFileName());
        material.setFileUrl(request.getFileUrl());
        material.setUpdatedAt(LocalDateTime.now());

        StudyMaterial updatedMaterial = studyMaterialRepository.save(material);

        return materialMapper.toResponse(updatedMaterial);
    }

    @Override
    public void deleteMaterial(String id) {

        StudyMaterial material = studyMaterialRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Study Material not found with id : " + id));

        studyMaterialRepository.delete(material);
    }

    @Override
    public List<MaterialResponse> getMaterialsByBatch(String batchId) {

        return studyMaterialRepository.findByBatchId(batchId)
                .stream()
                .map(materialMapper::toResponse)
                .collect(Collectors.toList());
    }

}