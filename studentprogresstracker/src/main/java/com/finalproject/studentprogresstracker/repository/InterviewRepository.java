	package com.finalproject.studentprogresstracker.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.finalproject.studentprogresstracker.entity.Interview;

@Repository
public interface InterviewRepository extends MongoRepository<Interview, String> {

    Optional<Interview> findByStudentId(String studentId);
    long countByTrainerId(String trainerId);
}