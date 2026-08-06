package com.finalproject.studentprogresstracker.service;

import java.util.List;

import com.finalproject.studentprogresstracker.dto.request.AttendanceRequest;
import com.finalproject.studentprogresstracker.dto.response.AttendanceResponse;

public interface AttendanceService {

    AttendanceResponse markAttendance(AttendanceRequest request);

    AttendanceResponse updateAttendance(String id, AttendanceRequest request);

    List<AttendanceResponse> getAttendanceByStudent(String studentId);

    List<AttendanceResponse> getAttendanceByBatch(String batchId);

}