package com.finalproject.studentprogresstracker.service;

import java.util.List;

import com.finalproject.studentprogresstracker.dto.request.StudentRequest;
import com.finalproject.studentprogresstracker.dto.request.StudentUpdateRequest;
import com.finalproject.studentprogresstracker.dto.response.StudentDashboardResponse;
import com.finalproject.studentprogresstracker.dto.response.StudentResponse;

public interface StudentService {

    StudentResponse registerStudent(StudentRequest request);

    StudentResponse getStudentById(String id);

    List<StudentResponse> getAllStudents();

    StudentResponse updateStudent(String id, StudentUpdateRequest request);

    void deleteStudent(String id);

    StudentDashboardResponse getStudentDashboard(String studentId);

}