package com.finalproject.studentprogresstracker.mapper;

import org.springframework.stereotype.Component;

import com.finalproject.studentprogresstracker.dto.request.StudentRequest;
import com.finalproject.studentprogresstracker.dto.response.StudentResponse;
import com.finalproject.studentprogresstracker.entity.Student;

@Component
public class StudentMapper {

    public Student toEntity(StudentRequest request) {

        if (request == null) {
            return null;
        }

        return Student.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .mobile(request.getMobile())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .collegeName(request.getCollegeName())
                .degree(request.getDegree())
                .branch(request.getBranch())
                .passingYear(request.getPassingYear())
                .cgpa(request.getCgpa())
                .batchId(request.getBatchId())
                .profileImage(request.getProfileImage())
                .build();
    }

    public StudentResponse toResponse(Student student) {

        if (student == null) {
            return null;
        }

        return StudentResponse.builder()
                .id(student.getId())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .email(student.getEmail())
                .mobile(student.getMobile())
                .dateOfBirth(student.getDateOfBirth())
                .gender(student.getGender())
                .collegeName(student.getCollegeName())
                .degree(student.getDegree())
                .branch(student.getBranch())
                .passingYear(student.getPassingYear())
                .cgpa(student.getCgpa())
                .batchId(student.getBatchId())
                .profileImage(student.getProfileImage())
                .active(student.getActive())
                .build();
    }

}