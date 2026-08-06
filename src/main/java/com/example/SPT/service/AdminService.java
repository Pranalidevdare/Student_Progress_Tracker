package com.example.SPT.service;

import java.util.List;

import com.example.SPT.dto.request.AddTrainerRequest;
import com.example.SPT.dto.request.UpdateStudentRequest;
import com.example.SPT.dto.request.UpdateTrainerRequest;
import com.example.SPT.dto.response.AdminDashboardResponse;
import com.example.SPT.dto.response.StudentResponse;
import com.example.SPT.dto.response.UserResponse;

public interface AdminService {

    AdminDashboardResponse getDashboard();
    
    List<StudentResponse> getAllStudents();
    
    StudentResponse getStudentById(String id);
    
    StudentResponse updateStudent(
            String id,
            UpdateStudentRequest request
    );
    
    StudentResponse enableStudent(String id);

    StudentResponse disableStudent(String id);
    
    void deleteStudent(String id);
    
    UserResponse addTrainer(AddTrainerRequest request);
    
    List<UserResponse> getAllTrainers();
    
    UserResponse getTrainerById(String id);
    
    UserResponse updateTrainer(String id, UpdateTrainerRequest request);

}