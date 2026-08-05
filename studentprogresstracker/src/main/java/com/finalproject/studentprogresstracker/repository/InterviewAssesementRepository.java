package com.finalproject.studentprogresstracker.repository;

import com.finalproject.studentprogresstracker.entity.Interview;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface InterviewAssesementRepository
        extends MongoRepository<Interview,String> {

    List<Interview> findByCandidateId(String candidateId);

    List<Interview> findByTrainerId(String trainerId);

    List<Interview> findByFinalStatus(String finalStatus);
}