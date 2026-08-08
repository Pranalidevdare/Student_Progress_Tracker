package com.finalproject.studentprogresstracker.service.Impl;
import com.finalproject.studentprogresstracker.mapper.NoticeMapper;
import com.finalproject.studentprogresstracker.mapper.GuestSessionMapper;
import com.finalproject.studentprogresstracker.mapper.InterviewMapper;
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
import com.finalproject.studentprogresstracker.repository.AssessmentResultRepository;
import com.finalproject.studentprogresstracker.repository.AssignmentRepository;
import com.finalproject.studentprogresstracker.repository.GuestSessionRepository;
import com.finalproject.studentprogresstracker.repository.InterviewRepository;
import com.finalproject.studentprogresstracker.repository.NoticeRepository;
import com.finalproject.studentprogresstracker.repository.PerformanceRepository;
import com.finalproject.studentprogresstracker.repository.StudentRepository;
import com.finalproject.studentprogresstracker.repository.StudyMaterialRepository;
import com.finalproject.studentprogresstracker.service.StudentService;
import com.finalproject.studentprogresstracker.entity.Performance;
import com.finalproject.studentprogresstracker.entity.Interview;

import com.finalproject.studentprogresstracker.dto.response.NoticeResponse;
import com.finalproject.studentprogresstracker.dto.response.GuestSessionResponse;
import com.finalproject.studentprogresstracker.dto.response.InterviewResponse;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;
    private final PerformanceRepository performanceRepository;
    
    private final AssignmentRepository assignmentRepository;

    private final AssessmentResultRepository assessmentRepository;

    private final StudyMaterialRepository materialRepository;

    private final NoticeRepository noticeRepository;

    private final GuestSessionRepository guestSessionRepository;

   
    private final InterviewRepository interviewRepository;
    private final NoticeMapper noticeMapper;
    private final GuestSessionMapper guestSessionMapper;
    private final InterviewMapper interviewMapper;
    @Override
    public StudentResponse registerStudent(StudentRequest request) {

        if (studentRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException(
                    "Student already exists with email: " + request.getEmail());
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
                .orElseThrow(() ->
                        new RuntimeException("Student not found with id: " + id));

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
                        new RuntimeException("Student not found with id: " + id));

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
                        new RuntimeException("Student not found with id: " + id));

        studentRepository.delete(student);
    }

   
    @Override
    public StudentDashboardResponse getStudentDashboard(String studentId) {

        // Fetch Student
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Student not found with id : " + studentId));

        StudentResponse studentResponse = studentMapper.toResponse(student);

        // Fetch Performance
        Performance performance = performanceRepository
                .findByStudentId(studentId)
                .orElse(null);

        double attendance = 0.0;
        double assessmentPercentage = 0.0;
        double overallPerformance = 0.0;
        int currentRank = 0;
        String performanceStatus = "";

        if (performance != null) {

            attendance = performance.getAttendancePercentage() != null
                    ? performance.getAttendancePercentage()
                    : 0.0;

            assessmentPercentage = performance.getAssessmentPercentage() != null
                    ? performance.getAssessmentPercentage()
                    : 0.0;

            overallPerformance = performance.getOverallPercentage() != null
                    ? performance.getOverallPercentage()
                    : 0.0;

            currentRank = performance.getRank() != null
                    ? performance.getRank()
                    : 0;

            performanceStatus = performance.getPerformanceStatus() != null
                    ? performance.getPerformanceStatus().toString()
                    : "";
        }

        // Assignment Counts
        long totalAssignments =
                assignmentRepository.countByBatchId(student.getBatchId());

        long completedAssignments =
                assignmentRepository.countByStudentIdAndStatus(
                        studentId,
                        "COMPLETED");
        long pendingAssignments =
                Math.max(0, totalAssignments - completedAssignments);
        // Assessment Count
        long totalAssessments =
                assessmentRepository.countByStudentId(studentId);

        // Study Material Count
        long totalStudyMaterials =
                materialRepository.countByBatchId(student.getBatchId());

        // Latest Notices
        List<NoticeResponse> latestNotices =
                noticeRepository.findAllByOrderByCreatedAtDesc()
                        .stream()
                        .limit(5)
                        .map(noticeMapper::toResponse)
                        .toList();

        // Guest Sessions
        List<GuestSessionResponse> guestSessions =
                guestSessionRepository.findByBatchIdAndActiveTrue(student.getBatchId())
                        .stream()
                        .map(guestSessionMapper::toResponse)
                        .toList();

        // Upcoming Interview
        InterviewResponse interviewResponse =
                interviewRepository.findByStudentId(studentId)
                        .map(interviewMapper::toResponse)
                        .orElse(null);
        // Dashboard Response
        return StudentDashboardResponse.builder()

                .student(studentResponse)

                .attendancePercentage(attendance)

                .totalAssignments((int) totalAssignments)

                .completedAssignments((int) completedAssignments)

                .pendingAssignments((int) pendingAssignments)

                .totalAssessments((int) totalAssessments)

                .assessmentPercentage(assessmentPercentage)

                .overallPerformance(overallPerformance)

                .currentRank(currentRank)

                .performanceStatus(performanceStatus)

                .totalStudyMaterials((int) totalStudyMaterials)

                .latestNotices(latestNotices)

                .guestSessions(guestSessions)

                .upcomingInterview(interviewResponse)

                .build();
    
    }
}