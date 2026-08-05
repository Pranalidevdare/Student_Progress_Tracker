package com.finalproject.studentprogresstracker.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.finalproject.studentprogresstracker.entity.Attendance;
import com.finalproject.studentprogresstracker.repository.AttendanceRepository;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    // Mark Attendance
    public Attendance markAttendance(Attendance attendance) {

        attendance.setAttendanceDate(LocalDate.now());

        return attendanceRepository.save(attendance);
    }

    // Get All Attendance
    public List<Attendance> getAllAttendance() {

        return attendanceRepository.findAll();
    }

    // Get Attendance By Id
    public Attendance getAttendanceById(String attendanceId) {

        return attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance not found"));
    }

    // Get Attendance By Student
    public List<Attendance> getAttendanceByStudent(String studentId) {

        return attendanceRepository.findByStudentId(studentId);
    }

    // Get Attendance By Trainer
    public List<Attendance> getAttendanceByTrainer(String trainerId) {

        return attendanceRepository.findByTrainerId(trainerId);
    }

    // Get Attendance By Batch
    public List<Attendance> getAttendanceByBatch(String batchId) {

        return attendanceRepository.findByBatchId(batchId);
    }

    // Get Today's Attendance
    public List<Attendance> getTodayAttendance() {

        return attendanceRepository.findByAttendanceDate(LocalDate.now());
    }

    // Update Attendance
    public Attendance updateAttendance(String attendanceId,
                                       Attendance attendance) {

        Attendance existing =
                attendanceRepository.findById(attendanceId)
                        .orElseThrow(() ->
                                new RuntimeException("Attendance not found"));

        existing.setStudentId(attendance.getStudentId());
        existing.setTrainerId(attendance.getTrainerId());
        existing.setBatchId(attendance.getBatchId());
        existing.setAttendanceDate(attendance.getAttendanceDate());
        existing.setStatus(attendance.getStatus());

        return attendanceRepository.save(existing);
    }

    // Delete Attendance
    public String deleteAttendance(String attendanceId) {

        Attendance attendance =
                attendanceRepository.findById(attendanceId)
                        .orElseThrow(() ->
                                new RuntimeException("Attendance not found"));

        attendanceRepository.delete(attendance);

        return "Attendance Deleted Successfully";
    }

}