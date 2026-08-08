package com.example.SPT.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.SPT.entity.StudyMaterial;

@Repository
public interface StudyMaterialRepository extends MongoRepository<StudyMaterial, String> {

    List<StudyMaterial> findByBatchId(String batchId);

    List<StudyMaterial> findByTrainerId(String trainerId);
    long countByTrainerId(String trainerId);
    long countByBatchId(String batchId);
}