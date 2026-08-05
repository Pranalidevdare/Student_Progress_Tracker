package com.finalproject.studentprogresstracker.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.finalproject.studentprogresstracker.entity.Performance;

@Repository
public interface PerformanceRepository extends MongoRepository<Performance, String> {

    List<Performance> findByStudentId(String studentId);

    List<Performance> findByTrainerId(String trainerId);

}