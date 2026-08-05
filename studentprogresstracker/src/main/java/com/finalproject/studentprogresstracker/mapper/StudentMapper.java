package com.finalproject.studentprogresstracker.mapper;

import com.finalproject.studentprogresstracker.dto.StudentProfileResponseDto;
import com.finalproject.studentprogresstracker.dto.UpdateStudentProfileRequestDto;
import com.finalproject.studentprogresstracker.entity.Student;
import org.springframework.stereotype.Component;

/**
 * Mapper class for converting Student Entity
 * to DTO and vice versa.
 */
@Component
public class StudentMapper {

    /**
     * Converts Student Entity to Profile Response DTO.
     *
     * @param student Student entity
     * @return StudentProfileResponseDto
     */
    public StudentProfileResponseDto toProfileResponse(Student student) {

        if (student == null) {
            return null;
        }

        return StudentProfileResponseDto.builder()
                .studentId(student.getStudentId())
                .name(student.getName())
                .email(student.getEmail())
                .batch(student.getBatch())
                .phone(student.getPhone())
                .address(student.getAddress())
                .profilePicture(student.getProfilePicture())
                .build();
    }

    /**
     * Updates editable fields of Student entity.
     *
     * Non-editable fields:
     * - studentId
     * - name
     * - email
     * - batch
     *
     * @param student Existing student entity
     * @param request Update request DTO
     */
    public void updateStudent(Student student,
                              UpdateStudentProfileRequestDto request) {

        if (student == null || request == null) {
            return;
        }

        student.setPhone(request.getPhone());
        student.setAddress(request.getAddress());
        student.setProfilePicture(request.getProfilePicture());
    }
}