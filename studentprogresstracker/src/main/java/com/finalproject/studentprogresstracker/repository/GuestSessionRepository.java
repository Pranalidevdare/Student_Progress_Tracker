package com.finalproject.studentprogresstracker.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.finalproject.studentprogresstracker.entity.GuestSession;

@Repository
public interface GuestSessionRepository extends MongoRepository<GuestSession, String> {

    List<GuestSession> findByTrainerId(String trainerId);

    List<GuestSession> findBySessionDate(LocalDate sessionDate);

}