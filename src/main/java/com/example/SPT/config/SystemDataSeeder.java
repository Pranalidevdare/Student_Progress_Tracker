package com.example.SPT.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.SPT.entity.*;
import com.example.SPT.enums.*;
import com.example.SPT.repository.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemDataSeeder {

    @Value("${app.seed-demo-data:false}")
    private boolean enableStartupSeeding;

    private final UserRepository userRepository;
    private final BatchRepository batchRepository;
    private final StudentRepository studentRepository;
    private final TrainerRepository trainerRepository;
    private final ApplicationRepository applicationRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final MonthlyAssessmentRepository monthlyAssessmentRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final AttendanceRepository attendanceRepository;
    private final StudyMaterialRepository studyMaterialRepository;
    private final NoticeRepository noticeRepository;
    private final GuestSessionRepository guestSessionRepository;
    private final InterviewRepository interviewRepository;
    private final PerformanceRepository performanceRepository;
    private final FeedbackRepository feedbackRepository;
    private final PasswordEncoder passwordEncoder;

    @EventListener(ApplicationReadyEvent.class)
    public void seedOnStartup() {
        if (!enableStartupSeeding) {
            log.info("System Data Seeder: startup seeding is disabled by configuration.");
            return;
        }

        try {
            seedDatabase();
        } catch (Exception e) {
            log.error("System Data Seeder: startup seeding failed", e);
        }
    }

    public void seedDatabase() throws Exception {

        // Check if full seeding has already occurred
        if (batchRepository.count() > 0) {
            log.info("System Data Seeder: Initial data already exists. Skipping data seeding.");
            return;
        }

        log.info("System Data Seeder: Initializing comprehensive sample data...");

        // -------------------------------------------------------------
        // 1. SEED USER ACCOUNTS
        // -------------------------------------------------------------
        User adminUser = userRepository.findByEmail("admin@spt.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("Super Admin")
                        .email("admin@spt.com")
                        .password(passwordEncoder.encode("admin123"))
                        .phone("9876543210")
                        .role(Role.ADMIN)
                        .enabled(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build())
        );

        User infoBeansAdmin = userRepository.findByEmail("admin.infobeans@spt.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("InfoBeans Admin Director")
                        .email("omchanne2024@gmail.com")
                        .password(passwordEncoder.encode("admin123"))
                        .phone("9981336599")
                        .role(Role.ADMIN)
                        .enabled(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build())
        );

        User techTrainerUser = userRepository.findByEmail("trainer@spt.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("Vikram Malhotra")
                        .email("trainer@spt.com")
                        .password(passwordEncoder.encode("trainer123"))
                        .phone("9876543211")
                        .role(Role.TRAINER)
                        .trainerType(TrainerType.TECHNICAL)
                        .enabled(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build())
        );

        User softTrainerUser = userRepository.findByEmail("softskills@spt.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("Ananya Deshmukh")
                        .email("softskills@spt.com")
                        .password(passwordEncoder.encode("trainer123"))
                        .phone("9876543212")
                        .role(Role.TRAINER)
                        .trainerType(TrainerType.SOFT_SKILLS)
                        .enabled(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build())
        );

        User studentUser1 = userRepository.findByEmail("student@spt.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("Aarav Sharma")
                        .email("student@spt.com")
                        .password(passwordEncoder.encode("student123"))
                        .phone("9876543213")
                        .role(Role.STUDENT)
                        .enabled(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build())
        );

        User studentUser2 = userRepository.findByEmail("rahul.sharma@spt.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("Rahul Sharma")
                        .email("rahul.sharma@spt.com")
                        .password(passwordEncoder.encode("student123"))
                        .phone("9876543214")
                        .role(Role.STUDENT)
                        .enabled(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build())
        );

        User studentUser3 = userRepository.findByEmail("priya.patel@spt.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("Priya Patel")
                        .email("priya.patel@spt.com")
                        .password(passwordEncoder.encode("student123"))
                        .phone("9876543215")
                        .role(Role.STUDENT)
                        .enabled(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build())
        );

        // -------------------------------------------------------------
        // 2. SEED BATCHES
        // -------------------------------------------------------------
        Batch batch1 = batchRepository.save(Batch.builder()
                .batchName("Java Full Stack - Batch 2026-A")
                .courseName("Full Stack Java Development")
                .technicalTrainer(techTrainerUser)
                .softSkillsTrainer(softTrainerUser)
                .startDate(LocalDate.now().minusMonths(2))
                .endDate(LocalDate.now().plusMonths(4))
                .capacity(30)
                .status(BatchStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        Batch batch2 = batchRepository.save(Batch.builder()
                .batchName("Data Science & AI - Batch 2026-B")
                .courseName("Data Science & Machine Learning")
                .technicalTrainer(techTrainerUser)
                .softSkillsTrainer(softTrainerUser)
                .startDate(LocalDate.now().minusMonths(1))
                .endDate(LocalDate.now().plusMonths(5))
                .capacity(25)
                .status(BatchStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        // -------------------------------------------------------------
        // 3. SEED TRAINERS
        // -------------------------------------------------------------
        Trainer trainer1 = trainerRepository.save(Trainer.builder()
                .firstName("Vikram")
                .lastName("Malhotra")
                .email(techTrainerUser.getEmail())
                .mobile(techTrainerUser.getPhone())
                .employeeId("EMP-TRN-101")
                .specialization("Spring Boot & Microservices")
                .qualification("M.Tech Computer Science")
                .experience(8)
                .batchId(batch1.getId())
                .batchName(batch1.getBatchName())
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        // -------------------------------------------------------------
        // 4. SEED STUDENTS
        // -------------------------------------------------------------
        Student student1 = studentRepository.save(Student.builder()
                .studentId("STU001")
                .firstName("Aarav")
                .lastName("Sharma")
                .email(studentUser1.getEmail())
                .mobile(studentUser1.getPhone())
                .collegeName("IIT Bombay")
                .degree("B.Tech")
                .branch("Computer Science")
                .passingYear(2025)
                .cgpa(9.1)
                .batchId(batch1.getId())
                .batchName(batch1.getBatchName())
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        Student student2 = studentRepository.save(Student.builder()
                .studentId("STU002")
                .firstName("Rahul")
                .lastName("Sharma")
                .email(studentUser2.getEmail())
                .mobile(studentUser2.getPhone())
                .collegeName("NIT Trichy")
                .degree("B.Tech")
                .branch("Information Technology")
                .passingYear(2025)
                .cgpa(9.4)
                .batchId(batch1.getId())
                .batchName(batch1.getBatchName())
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        Student student3 = studentRepository.save(Student.builder()
                .studentId("STU003")
                .firstName("Priya")
                .lastName("Patel")
                .email(studentUser3.getEmail())
                .mobile(studentUser3.getPhone())
                .collegeName("BITS Pilani")
                .degree("B.E.")
                .branch("Computer Science")
                .passingYear(2025)
                .cgpa(8.9)
                .batchId(batch1.getId())
                .batchName(batch1.getBatchName())
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        // -------------------------------------------------------------
        // 5. SEED APPLICATIONS
        // -------------------------------------------------------------
        applicationRepository.saveAll(List.of(
                Application.builder()
                        .applicationNumber("APP2026001")
                        .fullName("Siddharth Varma")
                        .email("siddharth.varma@example.com")
                        .mobile("9123456780")
                        .collegeName("COEP Pune")
                        .branch("Computer Science")
                        .yearOfStudy("Final Year")
                        .familyIncome(250000.0)
                        .status(ApplicationStatus.SUBMITTED)
                        .active(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build(),

                Application.builder()
                        .applicationNumber("APP2026002")
                        .fullName("Neha Kulkarni")
                        .email("neha.kulkarni@example.com")
                        .mobile("9123456781")
                        .collegeName("VJTI Mumbai")
                        .branch("Information Technology")
                        .yearOfStudy("Final Year")
                        .familyIncome(280000.0)
                        .status(ApplicationStatus.APTITUDE_SCHEDULED)
                        .active(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build(),

                Application.builder()
                        .applicationNumber("APP2026003")
                        .fullName("Rohan Mehta")
                        .email("rohan.mehta@example.com")
                        .mobile("9123456782")
                        .collegeName("MIT Manipal")
                        .branch("Computer Science")
                        .yearOfStudy("Passed Out")
                        .familyIncome(320000.0)
                        .status(ApplicationStatus.DOCUMENTS_SUBMITTED)
                        .active(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build()
        ));

        // -------------------------------------------------------------
        // 6. SEED ASSIGNMENTS & SUBMISSIONS
        // -------------------------------------------------------------
        Assignment assignment1 = assignmentRepository.save(Assignment.builder()
                .title("Spring Boot REST API & JWT Authentication")
                .description("Build a RESTful web service with Spring Security JWT authentication and MongoDB storage.")
                .subject("Spring Boot")
                .batchId(batch1.getId() != null ? batch1.getId() : "BATCH001")
                .trainerId(trainer1.getId())
                .trainerName(trainer1.getFirstName() + " " + trainer1.getLastName())
                .totalMarks(100)
                .assignedDate(LocalDate.now().minusDays(5))
                .dueDate(LocalDate.now().plusDays(7))
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        Assignment assignment2 = assignmentRepository.save(Assignment.builder()
                .title("Java Core OOP Practice & Collections")
                .description("Implement Inheritance, Polymorphism, Interfaces, and Java Collection Framework exercises.")
                .subject("Java")
                .batchId(batch1.getId() != null ? batch1.getId() : "BATCH001")
                .trainerId(trainer1.getId())
                .trainerName(trainer1.getFirstName() + " " + trainer1.getLastName())
                .totalMarks(100)
                .assignedDate(LocalDate.now().minusDays(10))
                .dueDate(LocalDate.now().plusDays(2))
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        Assignment assignment3 = assignmentRepository.save(Assignment.builder()
                .title("SQL Queries & Aggregations Task")
                .description("Write complex SQL JOINs, GROUP BY aggregations, and subqueries on student dataset.")
                .subject("SQL")
                .batchId(batch1.getId() != null ? batch1.getId() : "BATCH001")
                .trainerId(trainer1.getId())
                .trainerName(trainer1.getFirstName() + " " + trainer1.getLastName())
                .totalMarks(50)
                .assignedDate(LocalDate.now().minusDays(15))
                .dueDate(LocalDate.now().minusDays(2))
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        assignmentSubmissionRepository.save(AssignmentSubmission.builder()
                .assignmentId(assignment1.getId())
                .assignmentTitle(assignment1.getTitle())
                .studentId(student1.getId())
                .studentName(student1.getFirstName() + " " + student1.getLastName())
                .trainerId(trainer1.getId())
                .trainerName(trainer1.getFirstName() + " " + trainer1.getLastName())
                .batchId(batch1.getId() != null ? batch1.getId() : "BATCH001")
                .submissionFileUrl("/uploads/spt-assignment1.pdf")
                .submissionRemarks("Completed all REST endpoints and added unit tests.")
                .obtainedMarks(95)
                .trainerRemarks("Excellent REST controller architecture and clean unit test coverage.")
                .status("EVALUATED")
                .submittedAt(LocalDateTime.now().minusDays(1))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        // -------------------------------------------------------------
        // 7. SEED MONTHLY ASSESSMENTS & RESULTS
        // -------------------------------------------------------------
        MonthlyAssessment assessment1 = monthlyAssessmentRepository.save(MonthlyAssessment.builder()
                .title("Data Structures & Algorithms Mid-Term Quiz")
                .subject("DSA")
                .description("Covers Arrays, Stacks, Queues, Hash Tables & Linked Lists.")
                .batchId("BATCH001")
                .trainerId(trainer1.getId())
                .trainerName(trainer1.getFirstName() + " " + trainer1.getLastName())
                .totalMarks(50)
                .durationInMinutes(45)
                .assessmentDate(LocalDate.now())
                .status("ONGOING")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        MonthlyAssessment assessment2 = monthlyAssessmentRepository.save(MonthlyAssessment.builder()
                .title("Spring Boot REST Microservices Exam")
                .subject("Java")
                .description("Comprehensive assessment on Spring Data JPA, Controllers & Security.")
                .batchId("BATCH001")
                .trainerId(trainer1.getId())
                .trainerName(trainer1.getFirstName() + " " + trainer1.getLastName())
                .totalMarks(100)
                .durationInMinutes(90)
                .assessmentDate(LocalDate.now().plusDays(5))
                .status("UPCOMING")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        MonthlyAssessment assessment3 = monthlyAssessmentRepository.save(MonthlyAssessment.builder()
                .title("React Frontend Architecture Evaluation")
                .subject("React.js")
                .description("Practical React hooks, state management, and component testing.")
                .batchId("BATCH001")
                .trainerId(trainer1.getId())
                .trainerName(trainer1.getFirstName() + " " + trainer1.getLastName())
                .totalMarks(50)
                .durationInMinutes(60)
                .assessmentDate(LocalDate.now().minusDays(10))
                .status("COMPLETED")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        assessmentResultRepository.save(AssessmentResult.builder()
                .assessmentId(assessment1.getId())
                .assessmentTitle(assessment1.getTitle())
                .studentId(student1.getId())
                .studentName(student1.getFirstName() + " " + student1.getLastName())
                .trainerId(trainer1.getId())
                .batchId(batch1.getId())
                .totalMarks(50)
                .obtainedMarks(46)
                .percentage(92.0)
                .resultStatus("PASS")
                .trainerRemarks("Excellent performance in Streams API.")
                .submittedAt(LocalDateTime.now().minusDays(2))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        // -------------------------------------------------------------
        // 8. SEED ATTENDANCE RECORDS
        // -------------------------------------------------------------
        attendanceRepository.save(Attendance.builder()
                .batchId(batch1.getId())
                .studentId(student1.getId())
                .studentName(student1.getFirstName() + " " + student1.getLastName())
                .trainerId(trainer1.getId())
                .attendanceDate(LocalDate.now().minusDays(1))
                .status("PRESENT")
                .remarks("On time")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        attendanceRepository.save(Attendance.builder()
                .batchId(batch1.getId())
                .studentId(student2.getId())
                .studentName(student2.getFirstName() + " " + student2.getLastName())
                .trainerId(trainer1.getId())
                .attendanceDate(LocalDate.now().minusDays(1))
                .status("PRESENT")
                .remarks("On time")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        // -------------------------------------------------------------
        // 9. SEED STUDY MATERIALS
        // -------------------------------------------------------------
        studyMaterialRepository.save(StudyMaterial.builder()
                .title("Mastering Spring Boot 3 & MongoDB")
                .description("Comprehensive guide to building production-ready Spring Boot microservices with MongoDB.")
                .subject("Java Spring Boot")
                .materialType("PDF")
                .fileName("spring-boot-guide.pdf")
                .fileUrl("https://spt-assets.s3.amazonaws.com/materials/spring-boot-guide.pdf")
                .batchId(batch1.getId())
                .trainerId(trainer1.getId())
                .trainerName(trainer1.getFirstName() + " " + trainer1.getLastName())
                .uploadedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        // -------------------------------------------------------------
        // 10. SEED NOTICES
        // -------------------------------------------------------------
        noticeRepository.save(Notice.builder()
                .title("Upcoming Mock Technical Interviews Schedule")
                .description("Mock technical interviews for Java Full Stack Batch 2026-A start from next Monday.")
                .category("ACADEMIC")
                .priority("HIGH")
                .batchId(batch1.getId())
                .trainerId(trainer1.getId())
                .trainerName(trainer1.getFirstName() + " " + trainer1.getLastName())
                .publishDate(LocalDate.now())
                .expiryDate(LocalDate.now().plusDays(14))
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        // -------------------------------------------------------------
        // 11. SEED GUEST SESSIONS & MOCK INTERVIEWS
        // -------------------------------------------------------------
        guestSessionRepository.save(GuestSession.builder()
                .title("Building Scalable Cloud Native Architectures")
                .speakerName("Alex Johnson")
                .companyName("Amazon Web Services")
                .designation("Principal Cloud Architect")
                .organization("AWS")
                .topic("Cloud Architectures & Microservices")
                .description("Industry insights on cloud microservices.")
                .sessionDate(LocalDate.now().plusDays(5))
                .sessionTime("10:00 AM - 12:00 PM")
                .venue("Google Meet / Online")
                .batchId(batch1.getId())
                .trainerId(trainer1.getId())
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        interviewRepository.save(Interview.builder()
                .studentId(student1.getId())
                .studentName(student1.getFirstName() + " " + student1.getLastName())
                .trainerId(trainer1.getId())
                .trainerName(trainer1.getFirstName() + " " + trainer1.getLastName())
                .batchId(batch1.getId())
                .interviewDate(LocalDate.now().minusDays(2))
                .interviewType("TECHNICAL_ROUND_1")
                .technicalMarks(90)
                .softSkillMarks(85)
                .communicationMarks(85)
                .problemSolvingMarks(90)
                .behaviourMarks(88)
                .totalMarks(438)
                .remarks("Strong understanding of Spring Security and MongoDB indexing.")
                .status("COMPLETED")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        // -------------------------------------------------------------
        // 12. SEED PERFORMANCE & FEEDBACK
        // -------------------------------------------------------------
        performanceRepository.save(Performance.builder()
                .studentId(student1.getId())
                .studentName(student1.getFirstName() + " " + student1.getLastName())
                .batchId(batch1.getId())
                .attendancePercentage(96.5)
                .assignmentPercentage(95.0)
                .assessmentPercentage(92.0)
                .interviewPercentage(88.0)
                .overallPercentage(93.8)
                .rank(1)
                .performanceStatus(PerformanceStatus.EXCELLENT)
                .remarks("Top performing student in batch.")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        feedbackRepository.save(Feedback.builder()
                .studentId(student1.getId())
                .studentName(student1.getFirstName() + " " + student1.getLastName())
                .trainerId(trainer1.getId())
                .trainerName(trainer1.getFirstName() + " " + trainer1.getLastName())
                .batchId(batch1.getId())
                .rating(5)
                .subject("Technical Training Feedback")
                .comments("Aarav consistently delivers clean code and actively participates in discussions.")
                .status("REVIEWED")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        log.info("System Data Seeder: ALL SAMPLE DATA SEEDED SUCCESSFULLY!");
        log.info("    Accounts available:");
        log.info("    ADMIN:   admin@spt.com           / admin123");
        log.info("    ADMIN:   admin.infobeans@spt.com / admin123");
        log.info("    TRAINER: trainer@spt.com         / trainer123");
        log.info("    STUDENT: student@spt.com         / student123");
        log.info("    STUDENT: rahul.sharma@spt.com     / student123");
    }
}
