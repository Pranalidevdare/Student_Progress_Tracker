package com.example.SPT.service;

import java.util.List;

import com.example.SPT.dto.request.AttendanceRequest;
import com.example.SPT.dto.response.AttendanceResponse;

public interface AttendanceService {

    AttendanceResponse markAttendance(AttendanceRequest request);

    AttendanceResponse updateAttendance(String id, AttendanceRequest request);

    List<AttendanceResponse> getAttendanceByStudent(String studentId);

    List<AttendanceResponse> getAttendanceByBatch(String batchId);

}