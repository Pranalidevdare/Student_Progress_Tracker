package com.example.SPT.mapper;

import org.springframework.stereotype.Component;

import com.example.SPT.dto.response.AttendanceResponse;
import com.example.SPT.entity.Attendance;

@Component
public class AttendanceMapper {

    public AttendanceResponse toResponse(Attendance attendance) {

        if (attendance == null) {
            return null;
        }

        return AttendanceResponse.builder()
                .id(attendance.getId())
                .studentId(attendance.getStudentId())
                .studentName(attendance.getStudentName())
                .trainerId(attendance.getTrainerId())
                .trainerName(attendance.getTrainerName())
                .batchId(attendance.getBatchId())
                .attendanceDate(attendance.getAttendanceDate())
                .status(attendance.getStatus())
                .remarks(attendance.getRemarks())
                .build();
    }
}