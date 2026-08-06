package com.finalproject.studentprogresstracker.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.finalproject.studentprogresstracker.entity.Performance;

@Repository
public interface PerformanceRepository extends MongoRepository<Performance, String> {

    Optional<Performance> findByStudentId(String studentId);

}