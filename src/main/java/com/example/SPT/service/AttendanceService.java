package com.example.SPT.service;

import java.time.LocalDate;
import java.util.List;

import com.example.SPT.dto.request.AttendanceRequest;
import com.example.SPT.dto.request.BulkAttendanceRequest;
import com.example.SPT.dto.response.AttendanceResponse;
import com.example.SPT.dto.response.StudentMonthlyAttendanceResponse;
import com.example.SPT.dto.response.TodayAttendanceResponse;

public interface AttendanceService {

    AttendanceResponse markAttendance(AttendanceRequest request);

    AttendanceResponse markAttendance(AttendanceRequest request, String trainerEmail);

    AttendanceResponse updateAttendance(String id, AttendanceRequest request);

    AttendanceResponse updateAttendance(String id, AttendanceRequest request, String trainerEmail);

    List<AttendanceResponse> getAttendanceByStudent(String studentId);

    List<AttendanceResponse> getAttendanceByBatch(String batchId);

    TodayAttendanceResponse getTodayAttendance(String batchId, LocalDate date, String sessionType, String trainerEmail);

    TodayAttendanceResponse bulkMarkAttendance(BulkAttendanceRequest request, String trainerEmail);

    StudentMonthlyAttendanceResponse getStudentMonthlyAttendance(String studentId, Integer month, Integer year, String trainerEmail);

    TodayAttendanceResponse getAttendanceHistory(String batchId, LocalDate date, String sessionType, String trainerEmail);
}