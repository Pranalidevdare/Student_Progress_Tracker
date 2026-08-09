package com.example.SPT.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.SPT.entity.Attendance;

@Repository
public interface AttendanceRepository extends MongoRepository<Attendance, String> {

    List<Attendance> findByStudentId(String studentId);

    List<Attendance> findByBatchId(String batchId);

    List<Attendance> findByAttendanceDate(LocalDate attendanceDate);
    long countByTrainerIdAndAttendanceDate(
            String trainerId,
            LocalDate attendanceDate);

}