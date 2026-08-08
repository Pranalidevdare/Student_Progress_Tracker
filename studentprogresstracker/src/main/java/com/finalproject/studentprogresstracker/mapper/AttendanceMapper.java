package com.finalproject.studentprogresstracker.mapper;

import org.springframework.stereotype.Component;

import com.finalproject.studentprogresstracker.dto.response.AttendanceResponse;
import com.finalproject.studentprogresstracker.entity.Attendance;

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