package com.example.SPT.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.SPT.entity.AptitudeTestSchedule;

@Repository
public interface AptitudeTestScheduleRepository
        extends MongoRepository<AptitudeTestSchedule, String> {

    // Find all schedules for a particular date
    List<AptitudeTestSchedule> findByTestDate(LocalDate testDate);

    // Find schedules by status
    List<AptitudeTestSchedule> findByStatus(String status);

    // Find the latest scheduled test
    Optional<AptitudeTestSchedule> findFirstByStatusOrderByTestDateAscStartTimeAsc(
            String status);
}