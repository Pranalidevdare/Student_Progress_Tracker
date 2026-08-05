package com.finalproject.studentprogresstracker.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.finalproject.studentprogresstracker.entity.Assignment;

@Repository
public interface AssignmentRepository extends MongoRepository<Assignment, String> {

    List<Assignment> findByTrainerId(String trainerId);

    List<Assignment> findByBatchId(String batchId);

    List<Assignment> findByStatus(String status);

}