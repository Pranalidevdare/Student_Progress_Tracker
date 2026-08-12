package com.example.SPT.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.SPT.entity.Batch;
import com.example.SPT.enums.BatchStatus;


@Repository
public interface BatchRepository extends MongoRepository<Batch, String> {

    boolean existsByBatchName(String batchName);

    Optional<Batch> findByBatchName(String batchName);

    List<Batch> findByStatus(BatchStatus status);

    List<Batch> findByCourseNameIgnoreCase(String courseName);

    List<Batch> findByTechnicalTrainer_Id(String trainerId);

    List<Batch> findBySoftSkillsTrainer_Id(String trainerId);

    long countByStatus(BatchStatus status);
}