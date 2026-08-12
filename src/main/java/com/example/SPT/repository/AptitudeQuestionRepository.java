package com.example.SPT.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.SPT.entity.AptitudeQuestion;

@Repository
public interface AptitudeQuestionRepository
        extends MongoRepository<AptitudeQuestion, String> {

    // Get all active aptitude questions
    List<AptitudeQuestion> findByActiveTrue();

    // Get active questions by category
    List<AptitudeQuestion> findByCategoryAndActiveTrue(
            String category);

    // Get questions by category
    List<AptitudeQuestion> findByCategory(
            String category);

    // Get all questions sorted by category
    List<AptitudeQuestion> findAllByOrderByCategoryAsc();

    // Get active questions sorted by category
    List<AptitudeQuestion> findByActiveTrueOrderByCategoryAsc();
}