package com.finalproject.studentprogresstracker.service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.finalproject.studentprogresstracker.repository.AssignmentRepository;
import com.finalproject.studentprogresstracker.repository.AttendanceRepository;
import com.finalproject.studentprogresstracker.repository.FeedbackRepository;
import com.finalproject.studentprogresstracker.repository.GuestSessionRepository;
import com.finalproject.studentprogresstracker.repository.NoticeRepository;
import com.finalproject.studentprogresstracker.repository.PerformanceRepository;
import com.finalproject.studentprogresstracker.repository.StudyMaterialRepository;
import com.finalproject.studentprogresstracker.repository.TestRepository;
import com.finalproject.studentprogresstracker.repository.TrainerRepository;

@Service
public class DashboardService {

    @Autowired
    private TrainerRepository trainerRepository;

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

    public Map<String, Object> getDashboardSummary() {

        Map<String, Object> dashboard = new HashMap<>();

        dashboard.put("Total Trainers",
                trainerRepository.count());

        dashboard.put("Today's Attendance",
                attendanceRepository.findByAttendanceDate(LocalDate.now()).size());

        dashboard.put("Total Assignments",
                assignmentRepository.count());

        dashboard.put("Uploaded Study Materials",
                studyMaterialRepository.count());

        dashboard.put("Scheduled Tests",
                testRepository.count());

        dashboard.put("Performance Records",
                performanceRepository.count());

        dashboard.put("Student Feedback",
                feedbackRepository.count());

        dashboard.put("Notices",
                noticeRepository.count());

        dashboard.put("Guest Sessions",
                guestSessionRepository.count());

        return dashboard;
    }

}