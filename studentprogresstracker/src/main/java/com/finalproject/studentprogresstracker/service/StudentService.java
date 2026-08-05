package com.finalproject.studentprogresstracker.service;

import com.finalproject.studentprogresstracker.dto.DashboardResponseDto;
import com.finalproject.studentprogresstracker.dto.StudentProfileResponseDto;
import com.finalproject.studentprogresstracker.dto.UpdateStudentProfileRequestDto;
import com.finalproject.studentprogresstracker.entity.Assignment;
import com.finalproject.studentprogresstracker.entity.Attendance;
import com.finalproject.studentprogresstracker.entity.Feedback;
import com.finalproject.studentprogresstracker.entity.GuestSession;
import com.finalproject.studentprogresstracker.entity.Notice;
import com.finalproject.studentprogresstracker.entity.Performance;
import com.finalproject.studentprogresstracker.entity.Student;
import com.finalproject.studentprogresstracker.entity.StudyMaterial;
import com.finalproject.studentprogresstracker.entity.Test;
import com.finalproject.studentprogresstracker.exception.ResourceNotFoundException;
import com.finalproject.studentprogresstracker.mapper.StudentMapper;
import com.finalproject.studentprogresstracker.repository.AssignmentRepository;
import com.finalproject.studentprogresstracker.repository.AttendanceRepository;
import com.finalproject.studentprogresstracker.repository.FeedbackRepository;
import com.finalproject.studentprogresstracker.repository.GuestSessionRepository;
import com.finalproject.studentprogresstracker.repository.NoticeRepository;
import com.finalproject.studentprogresstracker.repository.PerformanceRepository;
import com.finalproject.studentprogresstracker.repository.StudentRepository;
import com.finalproject.studentprogresstracker.repository.StudyMaterialRepository;
import com.finalproject.studentprogresstracker.repository.TestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service class for Student Module.
 * Contains all business logic related to Student Dashboard.
 */
@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudyMaterialRepository studyMaterialRepository;
    private final PerformanceRepository performanceRepository;
    private final NoticeRepository noticeRepository;
    private final GuestSessionRepository guestSessionRepository;
    private final FeedbackRepository feedbackRepository;
    private final TestRepository testRepository;
    private final StudentMapper studentMapper;

    /**
     * Get student by email.
     */
    public Student getStudentByEmail(String email) {

        return studentRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Student not found"));
    }

    /**
     * Get student profile.
     */
    public StudentProfileResponseDto getProfile(String email) {

        Student student = getStudentByEmail(email);

        return studentMapper.toProfileResponse(student);
    }

    /**
     * Update profile.
     */
    public StudentProfileResponseDto updateProfile(
            String email,
            UpdateStudentProfileRequestDto request) {

        Student student = getStudentByEmail(email);

        studentMapper.updateStudent(student, request);

        Student updated = studentRepository.save(student);

        return studentMapper.toProfileResponse(updated);
    }

    /**
     * Dashboard
     */
    public DashboardResponseDto getDashboard(String email) {

        // Implementation will be added in Step-7

        return null;
    }

    /**
     * Attendance
     */
    public List<Attendance> getAttendance(String email) {

        // Implementation will be added later

        return null;
    }

    /**
     * Assignments
     */
    public List<Assignment> getAssignments(String email) {

        return null;
    }

    /**
     * Study Materials
     */
    public List<StudyMaterial> getStudyMaterials() {

        return null;
    }

    /**
     * Upcoming Tests
     */
    public List<Test> getUpcomingTests() {

        return null;
    }

    /**
     * Performance
     */
    public Performance getPerformance(String email) {

        return null;
    }

    /**
     * Notices
     */
    public List<Notice> getNotices() {

        return null;
    }

    /**
     * Guest Sessions
     */
    public List<GuestSession> getGuestSessions() {

        return null;
    }

    /**
     * Submit Feedback
     */
    public Feedback submitFeedback(Feedback feedback) {

        return feedbackRepository.save(feedback);
    }

    /**
     * View Own Feedback
     */
    public List<Feedback> getMyFeedback(String email) {

        return null;
    }

}