
package com.example.SPT.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.SPT.entity.AptitudeSchedule;

@Repository
public interface AptitudeScheduleRepository
        extends MongoRepository<AptitudeSchedule, String> {

    List<AptitudeSchedule> findByTestDate(LocalDate testDate);

    List<AptitudeSchedule> findByStatus(String status);

    Optional<AptitudeSchedule> findByTestIdAndStatus(
            String testId,
            String status);
}