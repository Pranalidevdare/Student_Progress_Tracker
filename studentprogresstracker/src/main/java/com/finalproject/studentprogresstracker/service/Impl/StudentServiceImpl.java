package com.finalproject.studentprogresstracker.service.Impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.finalproject.studentprogresstracker.dto.request.StudentRequest;
import com.finalproject.studentprogresstracker.dto.request.StudentUpdateRequest;
import com.finalproject.studentprogresstracker.dto.response.StudentDashboardResponse;
import com.finalproject.studentprogresstracker.dto.response.StudentResponse;
import com.finalproject.studentprogresstracker.entity.Student;
import com.finalproject.studentprogresstracker.mapper.StudentMapper;
import com.finalproject.studentprogresstracker.repository.StudentRepository;
import com.finalproject.studentprogresstracker.service.StudentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;

    private final StudentMapper studentMapper;

    @Override
    public StudentResponse registerStudent(StudentRequest request) {

        if (studentRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Student already exists with email : " + request.getEmail());
        }

        Student student = studentMapper.toEntity(request);

        student.setActive(true);
        student.setCreatedAt(LocalDateTime.now());
        student.setUpdatedAt(LocalDateTime.now());

        Student savedStudent = studentRepository.save(student);

        return studentMapper.toResponse(savedStudent);
    }

    @Override
    public StudentResponse getStudentById(String id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id : " + id));

        return studentMapper.toResponse(student);
    }

    @Override
    public List<StudentResponse> getAllStudents() {

        return studentRepository.findAll()
                .stream()
                .map(studentMapper::toResponse)
                .collect(Collectors.toList());

    }
    @Override
    public StudentResponse updateStudent(String id, StudentUpdateRequest request) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Student not found with id : " + id));

        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setMobile(request.getMobile());
        student.setDateOfBirth(request.getDateOfBirth());
        student.setGender(request.getGender());
        student.setCollegeName(request.getCollegeName());
        student.setDegree(request.getDegree());
        student.setBranch(request.getBranch());
        student.setPassingYear(request.getPassingYear());
        student.setCgpa(request.getCgpa());
        student.setProfileImage(request.getProfileImage());

        student.setUpdatedAt(LocalDateTime.now());

        Student updatedStudent = studentRepository.save(student);

        return studentMapper.toResponse(updatedStudent);
    }

    @Override
    public void deleteStudent(String id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Student not found with id : " + id));

        studentRepository.delete(student);
    }
    @Override
    public StudentDashboardResponse getStudentDashboard(String studentId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Student not found with id : " + studentId));

        StudentResponse studentResponse = studentMapper.toResponse(student);

        StudentDashboardResponse dashboard = StudentDashboardResponse.builder()
                .student(studentResponse)

                // Default values
                .attendancePercentage(0.0)

                .totalAssignments(0)
                .completedAssignments(0)
                .pendingAssignments(0)

                .totalAssessments(0)
                .assessmentPercentage(0.0)

                .overallPerformance(0.0)

                .currentRank(0)

                .totalStudyMaterials(0)

                .build();

        return dashboard;
    }

}
