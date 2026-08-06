package com.finalproject.studentprogresstracker.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.finalproject.studentprogresstracker.entity.StudyMaterial;

@Repository
public interface StudyMaterialRepository extends MongoRepository<StudyMaterial, String> {

    List<StudyMaterial> findByBatchId(String batchId);

    List<StudyMaterial> findByTrainerId(String trainerId);

}