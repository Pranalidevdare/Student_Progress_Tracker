package com.finalproject.studentprogresstracker.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.finalproject.studentprogresstracker.entity.Notice;

@Repository
public interface NoticeRepository extends MongoRepository<Notice, String> {

    // Student - Active notices of a batch
    List<Notice> findByBatchIdAndActiveTrue(String batchId);

    // Student - All active notices
    List<Notice> findByActiveTrue();

    // Student - Active notices by category
    List<Notice> findByCategoryAndActiveTrue(String category);

    // Student - Active notices by priority
    List<Notice> findByPriorityAndActiveTrue(String priority);

    // Trainer - Notices created by trainer
    List<Notice> findByTrainerId(String trainerId);

    // Active notices whose expiry date has not passed
    List<Notice> findByExpiryDateGreaterThanEqualAndActiveTrue(LocalDate date);

    // Latest notices
    List<Notice> findAllByOrderByCreatedAtDesc();
    long countByTrainerId(String trainerId);

  
}