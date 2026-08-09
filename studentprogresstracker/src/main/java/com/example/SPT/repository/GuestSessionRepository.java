package com.example.SPT.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.SPT.entity.GuestSession;

@Repository
public interface GuestSessionRepository extends MongoRepository<GuestSession, String> {

    // Student - View active guest sessions for a batch
    List<GuestSession> findByBatchIdAndActiveTrue(String batchId);

    // Trainer - View all guest sessions created for a batch
    List<GuestSession> findByBatchId(String batchId);

    // Trainer - View all guest sessions created by a trainer
    List<GuestSession> findByTrainerId(String trainerId);

    // View all active guest sessions
    List<GuestSession> findByActiveTrue();
    long countByTrainerId(String trainerId);

}