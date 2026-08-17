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

    java.util.Optional<Attendance> findByStudentIdAndAttendanceDateAndSessionType(
            String studentId, LocalDate attendanceDate, String sessionType);

    List<Attendance> findByBatchIdAndAttendanceDate(String batchId, LocalDate attendanceDate);

    List<Attendance> findByBatchIdAndAttendanceDateAndSessionType(
            String batchId, LocalDate attendanceDate, String sessionType);

    List<Attendance> findByStudentIdAndAttendanceDateBetween(
            String studentId, LocalDate startDate, LocalDate endDate);

    List<Attendance> findByBatchIdAndAttendanceDateBetween(
            String batchId, LocalDate startDate, LocalDate endDate);

    long countByTrainerIdAndAttendanceDate(
            String trainerId,
            LocalDate attendanceDate);
    
    long countByAttendanceDate(LocalDate attendanceDate);
}