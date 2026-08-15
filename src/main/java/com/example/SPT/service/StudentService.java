package com.example.SPT.service;

import java.util.List;
import com.example.SPT.dto.request.StudentRequest;
import com.example.SPT.dto.request.StudentUpdateRequest;
import com.example.SPT.dto.response.StudentDashboardResponse;
import com.example.SPT.dto.response.StudentResponse;

public interface StudentService {
    StudentResponse registerStudent(StudentRequest request);
    StudentResponse getStudentById(String id);
    StudentResponse getCurrentStudent(String email);
    StudentResponse updateCurrentStudent(String email, StudentUpdateRequest request);
    List<StudentResponse> getAllStudents();
    StudentResponse updateStudent(String id, StudentUpdateRequest request);
    void deleteStudent(String id);
    StudentDashboardResponse getStudentDashboard(String studentId);
}