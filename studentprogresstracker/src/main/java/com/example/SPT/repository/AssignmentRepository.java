package com.example.SPT.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.SPT.entity.Assignment;

@Repository
public interface AssignmentRepository extends MongoRepository<Assignment, String> {

    List<Assignment> findByBatchId(String batchId);

    List<Assignment> findByTrainerId(String trainerId);

    long countByBatchId(String batchId);

    long countByTrainerId(String trainerId);
}