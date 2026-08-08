package com.example.SPT.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.SPT.entity.Feedback;

@Repository
public interface FeedbackRepository extends MongoRepository<Feedback, String> {

    List<Feedback> findByStudentId(String studentId);

    List<Feedback> findByTrainerId(String trainerId);

}