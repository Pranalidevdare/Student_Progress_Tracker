package com.finalproject.studentprogresstracker.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.finalproject.studentprogresstracker.entity.Test;

@Repository
public interface TestRepository extends MongoRepository<Test, String> {

    List<Test> findByTrainerId(String trainerId);

    List<Test> findByBatchId(String batchId);

}