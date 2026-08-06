package com.finalproject.studentprogresstracker.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.finalproject.studentprogresstracker.entity.Trainer;

@Repository
public interface TrainerRepository extends MongoRepository<Trainer, String> {

    Optional<Trainer> findByEmail(String email);

    boolean existsByEmail(String email);

}