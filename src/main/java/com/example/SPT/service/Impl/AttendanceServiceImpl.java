package com.example.SPT.service.Impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.SPT.dto.request.AttendanceRequest;
import com.example.SPT.dto.response.AttendanceResponse;
import com.example.SPT.entity.Attendance;
import com.example.SPT.mapper.AttendanceMapper;
import com.example.SPT.repository.AttendanceRepository;
import com.example.SPT.service.AttendanceService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;

    private final AttendanceMapper attendanceMapper;

    @Override
    public AttendanceResponse markAttendance(AttendanceRequest request) {

        Attendance attendance = Attendance.builder()
                .studentId(request.getStudentId())
                .trainerId(request.getTrainerId())
                .batchId(request.getBatchId())
                .attendanceDate(request.getAttendanceDate())
                .status(request.getStatus())
                .remarks(request.getRemarks())
                .build();

        Attendance savedAttendance = attendanceRepository.save(attendance);

        return attendanceMapper.toResponse(savedAttendance);
    }

    @Override
    public AttendanceResponse updateAttendance(String id, AttendanceRequest request) {

        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Attendance not found with id : " + id));

        attendance.setStudentId(request.getStudentId());
        attendance.setTrainerId(request.getTrainerId());
        attendance.setBatchId(request.getBatchId());
        attendance.setAttendanceDate(request.getAttendanceDate());
        attendance.setStatus(request.getStatus());
        attendance.setRemarks(request.getRemarks());

        Attendance updatedAttendance = attendanceRepository.save(attendance);

        return attendanceMapper.toResponse(updatedAttendance);
    }

    @Override
    public List<AttendanceResponse> getAttendanceByStudent(String studentId) {

        return attendanceRepository.findByStudentId(studentId)
                .stream()
                .map(attendanceMapper::toResponse)
                .collect(Collectors.toList());

    }

    @Override
    public List<AttendanceResponse> getAttendanceByBatch(String batchId) {

        return attendanceRepository.findByBatchId(batchId)
                .stream()
                .map(attendanceMapper::toResponse)
                .collect(Collectors.toList());

    }

}