package com.finalproject.studentprogresstracker.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.finalproject.studentprogresstracker.entity.Assignment;
import com.finalproject.studentprogresstracker.entity.Attendance;
import com.finalproject.studentprogresstracker.entity.Feedback;
import com.finalproject.studentprogresstracker.entity.GuestSession;
import com.finalproject.studentprogresstracker.entity.Notice;
import com.finalproject.studentprogresstracker.entity.Performance;
import com.finalproject.studentprogresstracker.entity.StudyMaterial;
import com.finalproject.studentprogresstracker.entity.Test;
import com.finalproject.studentprogresstracker.repository.AssignmentRepository;
import com.finalproject.studentprogresstracker.repository.AttendanceRepository;
import com.finalproject.studentprogresstracker.repository.FeedbackRepository;
import com.finalproject.studentprogresstracker.repository.GuestSessionRepository;
import com.finalproject.studentprogresstracker.repository.NoticeRepository;
import com.finalproject.studentprogresstracker.repository.PerformanceRepository;
import com.finalproject.studentprogresstracker.repository.StudyMaterialRepository;
import com.finalproject.studentprogresstracker.repository.TestRepository;

@Service
public class ReportService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private StudyMaterialRepository studyMaterialRepository;

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private PerformanceRepository performanceRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private GuestSessionRepository guestSessionRepository;

    // Attendance Report
    public List<Attendance> attendanceReport() {

        return attendanceRepository.findAll();
    }

    // Assignment Report
    public List<Assignment> assignmentReport() {

        return assignmentRepository.findAll();
    }

    // Study Material Report
    public List<StudyMaterial> studyMaterialReport() {

        return studyMaterialRepository.findAll();
    }

    // Test Report
    public List<Test> testReport() {

        return testRepository.findAll();
    }

    // Performance Report
    public List<Performance> performanceReport() {

        return performanceRepository.findAll();
    }

    // Feedback Report
    public List<Feedback> feedbackReport() {

        return feedbackRepository.findAll();
    }

    // Notice Report
    public List<Notice> noticeReport() {

        return noticeRepository.findAll();
    }

    // Guest Session Report
    public List<GuestSession> guestSessionReport() {

        return guestSessionRepository.findAll();
    }

    // Dashboard Statistics Report
    public Map<String, Long> dashboardReport() {

        Map<String, Long> report = new HashMap<>();

        report.put("Attendance", attendanceRepository.count());
        report.put("Assignments", assignmentRepository.count());
        report.put("Study Materials", studyMaterialRepository.count());
        report.put("Tests", testRepository.count());
        report.put("Performance", performanceRepository.count());
        report.put("Feedback", feedbackRepository.count());
        report.put("Notices", noticeRepository.count());
        report.put("Guest Sessions", guestSessionRepository.count());

        return report;
    }

}