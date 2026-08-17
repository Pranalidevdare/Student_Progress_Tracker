package com.example.SPT;

import static org.mockito.Mockito.verifyNoInteractions;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.SPT.config.SystemDataSeeder;
import com.example.SPT.repository.ApplicationRepository;
import com.example.SPT.repository.AssessmentResultRepository;
import com.example.SPT.repository.AssignmentRepository;
import com.example.SPT.repository.AssignmentSubmissionRepository;
import com.example.SPT.repository.AttendanceRepository;
import com.example.SPT.repository.BatchRepository;
import com.example.SPT.repository.FeedbackRepository;
import com.example.SPT.repository.GuestSessionRepository;
import com.example.SPT.repository.InterviewRepository;
import com.example.SPT.repository.MonthlyAssessmentRepository;
import com.example.SPT.repository.NoticeRepository;
import com.example.SPT.repository.PerformanceRepository;
import com.example.SPT.repository.StudentRepository;
import com.example.SPT.repository.StudyMaterialRepository;
import com.example.SPT.repository.TrainerRepository;
import com.example.SPT.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class SystemDataSeederTest {

    @Mock private UserRepository userRepository;
    @Mock private BatchRepository batchRepository;
    @Mock private StudentRepository studentRepository;
    @Mock private TrainerRepository trainerRepository;
    @Mock private ApplicationRepository applicationRepository;
    @Mock private AssignmentRepository assignmentRepository;
    @Mock private AssignmentSubmissionRepository assignmentSubmissionRepository;
    @Mock private MonthlyAssessmentRepository monthlyAssessmentRepository;
    @Mock private AssessmentResultRepository assessmentResultRepository;
    @Mock private AttendanceRepository attendanceRepository;
    @Mock private StudyMaterialRepository studyMaterialRepository;
    @Mock private NoticeRepository noticeRepository;
    @Mock private GuestSessionRepository guestSessionRepository;
    @Mock private InterviewRepository interviewRepository;
    @Mock private PerformanceRepository performanceRepository;
    @Mock private FeedbackRepository feedbackRepository;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks
    private SystemDataSeeder systemDataSeeder;

    @Test
    void seedOnStartup_skipsWhenStartupSeedingDisabled() {
        ReflectionTestUtils.setField(systemDataSeeder, "enableStartupSeeding", false);

        systemDataSeeder.seedOnStartup();

        verifyNoInteractions(
                userRepository,
                batchRepository,
                studentRepository,
                trainerRepository,
                applicationRepository,
                assignmentRepository,
                assignmentSubmissionRepository,
                monthlyAssessmentRepository,
                assessmentResultRepository,
                attendanceRepository,
                studyMaterialRepository,
                noticeRepository,
                guestSessionRepository,
                interviewRepository,
                performanceRepository,
                feedbackRepository,
                passwordEncoder
        );
    }
}
