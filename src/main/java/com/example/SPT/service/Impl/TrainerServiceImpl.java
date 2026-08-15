package com.example.SPT.service.Impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.SPT.dto.request.TrainerRequest;
import com.example.SPT.dto.response.GuestSessionResponse;
import com.example.SPT.dto.response.NoticeResponse;
import com.example.SPT.dto.response.TopperResponse;
import com.example.SPT.dto.response.TrainerDashboardResponse;
import com.example.SPT.dto.response.TrainerResponse;
import com.example.SPT.entity.Assignment;
import com.example.SPT.entity.AssignmentSubmission;
import com.example.SPT.entity.AssessmentResult;
import com.example.SPT.entity.Attendance;
import com.example.SPT.entity.Batch;
import com.example.SPT.entity.GuestSession;
import com.example.SPT.entity.Interview;
import com.example.SPT.entity.MonthlyAssessment;
import com.example.SPT.entity.Notice;
import com.example.SPT.entity.Performance;
import com.example.SPT.entity.Student;
import com.example.SPT.entity.StudyMaterial;
import com.example.SPT.entity.Trainer;
import com.example.SPT.entity.User;
import com.example.SPT.mapper.GuestSessionMapper;
import com.example.SPT.mapper.NoticeMapper;
import com.example.SPT.mapper.TrainerMapper;
import com.example.SPT.repository.AssessmentResultRepository;
import com.example.SPT.repository.AssignmentRepository;
import com.example.SPT.repository.AssignmentSubmissionRepository;
import com.example.SPT.repository.AttendanceRepository;
import com.example.SPT.repository.BatchRepository;
import com.example.SPT.repository.GuestSessionRepository;
import com.example.SPT.repository.InterviewRepository;
import com.example.SPT.repository.MonthlyAssessmentRepository;
import com.example.SPT.repository.NoticeRepository;
import com.example.SPT.repository.PerformanceRepository;
import com.example.SPT.repository.StudentRepository;
import com.example.SPT.repository.StudyMaterialRepository;
import com.example.SPT.repository.TrainerRepository;
import com.example.SPT.repository.UserRepository;
import com.example.SPT.service.TopperService;
import com.example.SPT.service.TrainerService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrainerServiceImpl implements TrainerService {

    private final TrainerRepository trainerRepository;
    private final UserRepository userRepository;
    private final BatchRepository batchRepository;
    private final StudentRepository studentRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final MonthlyAssessmentRepository monthlyAssessmentRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final StudyMaterialRepository materialRepository;
    private final AttendanceRepository attendanceRepository;
    private final NoticeRepository noticeRepository;
    private final GuestSessionRepository guestSessionRepository;
    private final InterviewRepository interviewRepository;
    private final PerformanceRepository performanceRepository;

    private final TopperService topperService;
    private final TrainerMapper trainerMapper;
    private final NoticeMapper noticeMapper;
    private final GuestSessionMapper guestSessionMapper;


    // =========================================================
    // REGISTER TRAINER
    // =========================================================

    @Override
    public TrainerResponse registerTrainer(
            TrainerRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Trainer request cannot be null");
        }

        if (request.getEmail() == null
                || request.getEmail().isBlank()) {

            throw new IllegalArgumentException(
                    "Trainer email is required");
        }

        if (trainerRepository.existsByEmail(
                request.getEmail())) {

            throw new RuntimeException(
                    "Trainer already exists with email : "
                            + request.getEmail());
        }

        Trainer trainer =
                trainerMapper.toEntity(request);

        trainer.setActive(true);

        LocalDateTime now =
                LocalDateTime.now();

        trainer.setCreatedAt(now);
        trainer.setUpdatedAt(now);

        Trainer savedTrainer =
                trainerRepository.save(trainer);

        return trainerMapper.toResponse(
                savedTrainer);
    }


    // =========================================================
    // GET TRAINER BY ID
    // =========================================================

    @Override
    public TrainerResponse getTrainerById(String id) {
        Trainer trainer = getTrainer(id);
        return trainerMapper.toResponse(trainer);
    }

    @Override
    public TrainerResponse getTrainerProfileByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Trainer email is required");
        }
        Trainer trainer = trainerRepository.findByEmail(email)
                .orElseGet(() -> {
                    // Fallback to searching user by email
                    User user = userRepository.findByEmail(email).orElse(null);
                    if (user != null) {
                        return trainerRepository.findById(user.getId()).orElse(null);
                    }
                    return null;
                });

        if (trainer == null) {
            // Create default trainer profile from user if trainer document missing
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Trainer profile not found for email: " + email));
            
            String[] names = user.getFullName() != null ? user.getFullName().split(" ", 2) : new String[]{"Faculty", "Trainer"};
            trainer = Trainer.builder()
                    .firstName(names[0])
                    .lastName(names.length > 1 ? names[1] : "")
                    .email(user.getEmail())
                    .mobile(user.getPhone())
                    .employeeId("EMP1024")
                    .specialization(user.getTrainerType() != null ? user.getTrainerType().name() : "TECHNICAL")
                    .qualification("B.E. Computer Science")
                    .experience(5)
                    .batchId("BATCH001")
                    .active(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            trainer = trainerRepository.save(trainer);
        }
        return trainerMapper.toResponse(trainer);
    }


    // =========================================================
    // GET ALL TRAINERS
    // =========================================================

    @Override
    public List<TrainerResponse> getAllTrainers() {

        return trainerRepository.findAll()
                .stream()
                .map(trainerMapper::toResponse)
                .collect(Collectors.toList());
    }


    // =========================================================
    // UPDATE TRAINER
    // =========================================================

    @Override
    public TrainerResponse updateTrainer(
            String id,
            TrainerRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Trainer request cannot be null");
        }

        Trainer trainer = getTrainer(id);
        String oldEmail = trainer.getEmail();

        trainer.setFirstName(request.getFirstName());
        trainer.setLastName(request.getLastName());
        trainer.setEmail(request.getEmail());
        trainer.setMobile(request.getMobile());
        if (request.getDateOfBirth() != null) {
            trainer.setDateOfBirth(request.getDateOfBirth());
        }
        trainer.setGender(request.getGender());
        trainer.setEmployeeId(request.getEmployeeId());
        trainer.setSpecialization(request.getSpecialization());
        trainer.setQualification(request.getQualification());
        trainer.setExperience(request.getExperience());
        trainer.setBatchId(request.getBatchId());
        trainer.setProfileImage(request.getProfileImage());
        trainer.setUpdatedAt(LocalDateTime.now());

        Trainer updatedTrainer = trainerRepository.save(trainer);

        // Sync with User account if exists
        userRepository.findByEmail(oldEmail).ifPresent(user -> {
            String fullName = (request.getFirstName() + " " + request.getLastName()).trim();
            user.setFullName(fullName);
            user.setPhone(request.getMobile());
            if (request.getEmail() != null && !request.getEmail().isBlank()) {
                user.setEmail(request.getEmail());
            }
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
        });

        return trainerMapper.toResponse(updatedTrainer);
    }

    @Override
    public TrainerResponse updateTrainerProfileByEmail(String email, TrainerRequest request) {
        TrainerResponse profile = getTrainerProfileByEmail(email);
        return updateTrainer(profile.getId(), request);
    }


    // =========================================================
    // DELETE TRAINER
    // =========================================================

    @Override
    public void deleteTrainer(
            String id) {

        Trainer trainer =
                getTrainer(id);

        trainerRepository.delete(trainer);
    }


    // =========================================================
    // TRAINER DASHBOARD
    // =========================================================

    @Override
    public TrainerDashboardResponse getTrainerDashboard(String trainerId) {
        return getTrainerDashboard(trainerId, null);
    }

    @Override
    public TrainerDashboardResponse getTrainerDashboard(String trainerId, String authenticatedEmail) {
        log.info("Fetching Trainer Dashboard - trainerId: '{}', authenticatedEmail: '{}'", trainerId, authenticatedEmail);

        String lookupEmail = (authenticatedEmail != null && !authenticatedEmail.isBlank())
                ? authenticatedEmail
                : (trainerId != null && trainerId.contains("@") ? trainerId : null);

        User user = null;
        if (lookupEmail != null) {
            user = userRepository.findByEmail(lookupEmail).orElse(null);
        } else if (trainerId != null && !trainerId.isBlank()) {
            user = userRepository.findById(trainerId).orElse(null);
        }

        Trainer trainer = null;
        if (lookupEmail != null) {
            trainer = trainerRepository.findByEmail(lookupEmail).orElse(null);
        } else if (trainerId != null && !trainerId.isBlank()) {
            trainer = trainerRepository.findById(trainerId)
                    .or(() -> trainerRepository.findByEmail(trainerId))
                    .orElse(null);
        }

        if (trainer == null && user != null && user.getEmail() != null) {
            trainer = trainerRepository.findByEmail(user.getEmail()).orElse(null);
        }

        // 1. Resolve Assigned Batch for the Trainer
        Batch resolvedBatch = resolveTrainerBatch(user, trainer);
        String effectiveBatchId = resolvedBatch != null ? resolvedBatch.getId()
                : (trainer != null && trainer.getBatchId() != null ? trainer.getBatchId() : "BATCH001");
        String batchName = resolvedBatch != null ? resolvedBatch.getBatchName()
                : (trainer != null && trainer.getBatchName() != null ? trainer.getBatchName() : "Batch 2026-A");

        log.info("Resolved effective batch: id='{}', name='{}'", effectiveBatchId, batchName);

        // 2. Build Trainer Details
        String trainerIdVal = trainer != null ? trainer.getId() : (user != null ? user.getId() : (trainerId != null ? trainerId : "TRN001"));
        String firstName = "Faculty";
        String lastName = "Trainer";
        if (trainer != null && trainer.getFirstName() != null) {
            firstName = trainer.getFirstName();
            lastName = trainer.getLastName() != null ? trainer.getLastName() : "";
        } else if (user != null && user.getFullName() != null) {
            String[] parts = user.getFullName().split(" ", 2);
            firstName = parts[0];
            lastName = parts.length > 1 ? parts[1] : "";
        }

        String specialization = "TECHNICAL";
        if (user != null && user.getTrainerType() != null) {
            specialization = user.getTrainerType().name();
        } else if (trainer != null && trainer.getSpecialization() != null) {
            specialization = trainer.getSpecialization();
        }

        TrainerResponse trainerResponse = TrainerResponse.builder()
                .id(trainerIdVal)
                .firstName(firstName)
                .lastName(lastName)
                .email(user != null ? user.getEmail() : (trainer != null ? trainer.getEmail() : (lookupEmail != null ? lookupEmail : "trainer@spt.com")))
                .specialization(specialization)
                .batchId(effectiveBatchId)
                .batchName(batchName)
                .build();

        // 3. Students assigned to batch
        List<Student> students = getStudentsForBatch(resolvedBatch, effectiveBatchId);
        int totalStudents = students.size();
        log.info("Assigned students count: {}", totalStudents);

        // 4. Assignments for batch
        List<Assignment> assignments = getAssignmentsForBatch(resolvedBatch, effectiveBatchId);
        int totalAssignments = assignments.size();
        log.info("Total assignments count: {}", totalAssignments);

        // 5. Assessments for batch
        List<MonthlyAssessment> assessments = getAssessmentsForBatch(resolvedBatch, effectiveBatchId);
        int totalAssessments = assessments.size();
        log.info("Total assessments count: {}", totalAssessments);

        // 6. Study Materials for batch
        List<StudyMaterial> materials = getMaterialsForBatch(resolvedBatch, effectiveBatchId);
        int totalStudyMaterials = materials.size();
        log.info("Total study materials count: {}", totalStudyMaterials);

        // 7. Attendance for today
        ZoneId zoneId = ZoneId.of("Asia/Kolkata");
        LocalDate today = LocalDate.now(zoneId);
        String allowedSessionType = determineAllowedSessionType(specialization);

        List<Attendance> todayAttendances = attendanceRepository.findByBatchIdAndAttendanceDateAndSessionType(
                effectiveBatchId, today, allowedSessionType);
        if (todayAttendances.isEmpty() && resolvedBatch != null && resolvedBatch.getBatchName() != null) {
            todayAttendances = attendanceRepository.findByBatchIdAndAttendanceDateAndSessionType(
                    resolvedBatch.getBatchName(), today, allowedSessionType);
        }

        long presentCount = todayAttendances.stream()
                .filter(a -> a != null && "PRESENT".equalsIgnoreCase(a.getStatus()))
                .count();
        int attendanceMarkedToday = (int) presentCount;
        log.info("Attendance marked today (present): {}", attendanceMarkedToday);

        // 8. Notices for batch / trainer / global
        List<Notice> notices = getNoticesForBatchAndTrainer(resolvedBatch, effectiveBatchId, trainerIdVal);
        int totalNotices = notices.size();
        List<NoticeResponse> latestNotices = notices.stream()
                .limit(5)
                .map(noticeMapper::toResponse)
                .collect(Collectors.toList());

        // 9. Guest Sessions
        List<GuestSession> guestSessions = getGuestSessionsForBatchAndTrainer(resolvedBatch, effectiveBatchId, trainerIdVal);
        int totalGuestSessions = guestSessions.size();
        List<GuestSessionResponse> upcomingGuestSessions = guestSessions.stream()
                .filter(session -> Boolean.TRUE.equals(session.getActive()))
                .filter(session -> session.getSessionDate() == null || !session.getSessionDate().isBefore(today))
                .sorted(Comparator.comparing(GuestSession::getSessionDate, Comparator.nullsLast(Comparator.naturalOrder())))
                .limit(5)
                .map(guestSessionMapper::toResponse)
                .collect(Collectors.toList());

        // 10. Interviews
        List<Interview> interviews = getInterviewsForBatchAndTrainer(students, trainerIdVal);
        int totalInterviews = interviews.size();

        // 11. Top Performers (Batch Rankers)
        List<TopperResponse> topPerformers = calculateTopPerformers(resolvedBatch, effectiveBatchId, students);

        return TrainerDashboardResponse.builder()
                .trainer(trainerResponse)
                .totalStudents(totalStudents)
                .totalAssignments(totalAssignments)
                .totalAssessments(totalAssessments)
                .totalStudyMaterials(totalStudyMaterials)
                .totalInterviews(totalInterviews)
                .attendanceMarkedToday(attendanceMarkedToday)
                .totalGuestSessions(totalGuestSessions)
                .totalNotices(totalNotices)
                .topPerformers(topPerformers)
                .latestNotices(latestNotices)
                .upcomingGuestSessions(upcomingGuestSessions)
                .build();
    }

    private Batch resolveTrainerBatch(User user, Trainer trainer) {
        Batch assignedBatch = null;
        if (user != null && user.getId() != null) {
            List<Batch> techBatches = batchRepository.findByTechnicalTrainer_Id(user.getId());
            if (techBatches != null && !techBatches.isEmpty()) {
                assignedBatch = techBatches.get(0);
            }
            if (assignedBatch == null) {
                List<Batch> softBatches = batchRepository.findBySoftSkillsTrainer_Id(user.getId());
                if (softBatches != null && !softBatches.isEmpty()) {
                    assignedBatch = softBatches.get(0);
                }
            }
        }

        if (assignedBatch == null && trainer != null && trainer.getBatchId() != null && !trainer.getBatchId().isBlank()) {
            assignedBatch = batchRepository.findById(trainer.getBatchId())
                    .orElseGet(() -> batchRepository.findAll().stream()
                            .filter(b -> trainer.getBatchId().equalsIgnoreCase(b.getBatchName()))
                            .findFirst()
                            .orElse(null));
        }

        if (assignedBatch != null) {
            return assignedBatch;
        }

        List<Batch> allBatches = batchRepository.findAll();
        if (!allBatches.isEmpty()) {
            return allBatches.get(0);
        }

        return null;
    }

    private List<Student> getStudentsForBatch(Batch batch, String effectiveBatchId) {
        List<Student> students = new ArrayList<>();
        if (effectiveBatchId != null && !effectiveBatchId.isBlank()) {
            students.addAll(studentRepository.findByBatchId(effectiveBatchId));
        }
        if (students.isEmpty() && batch != null) {
            students.addAll(studentRepository.findAll().stream()
                    .filter(s -> (batch.getBatchName() != null && batch.getBatchName().equalsIgnoreCase(s.getBatchName())) ||
                                 (batch.getId() != null && batch.getId().equalsIgnoreCase(s.getBatchId())))
                    .collect(Collectors.toList()));
        }
        Map<String, Student> unique = new LinkedHashMap<>();
        for (Student s : students) {
            if (s != null && s.getId() != null) {
                unique.putIfAbsent(s.getId(), s);
            }
        }
        return unique.values().stream()
                .filter(s -> s.getActive() == null || Boolean.TRUE.equals(s.getActive()))
                .collect(Collectors.toList());
    }

    private List<Assignment> getAssignmentsForBatch(Batch batch, String effectiveBatchId) {
        List<Assignment> list = new ArrayList<>();
        if (effectiveBatchId != null && !effectiveBatchId.isBlank()) {
            list.addAll(assignmentRepository.findByBatchId(effectiveBatchId));
        }
        if (list.isEmpty() && batch != null && batch.getBatchName() != null) {
            list.addAll(assignmentRepository.findByBatchId(batch.getBatchName()));
        }
        Map<String, Assignment> unique = new LinkedHashMap<>();
        for (Assignment a : list) {
            if (a != null && a.getId() != null) {
                unique.putIfAbsent(a.getId(), a);
            }
        }
        return new ArrayList<>(unique.values());
    }

    private List<MonthlyAssessment> getAssessmentsForBatch(Batch batch, String effectiveBatchId) {
        List<MonthlyAssessment> list = new ArrayList<>();
        if (effectiveBatchId != null && !effectiveBatchId.isBlank()) {
            list.addAll(monthlyAssessmentRepository.findByBatchId(effectiveBatchId));
        }
        if (list.isEmpty() && batch != null && batch.getBatchName() != null) {
            list.addAll(monthlyAssessmentRepository.findByBatchId(batch.getBatchName()));
        }
        Map<String, MonthlyAssessment> unique = new LinkedHashMap<>();
        for (MonthlyAssessment a : list) {
            if (a != null && a.getId() != null) {
                unique.putIfAbsent(a.getId(), a);
            }
        }
        return new ArrayList<>(unique.values());
    }

    private List<StudyMaterial> getMaterialsForBatch(Batch batch, String effectiveBatchId) {
        List<StudyMaterial> list = new ArrayList<>();
        if (effectiveBatchId != null && !effectiveBatchId.isBlank()) {
            list.addAll(materialRepository.findByBatchId(effectiveBatchId));
        }
        if (list.isEmpty() && batch != null && batch.getBatchName() != null) {
            list.addAll(materialRepository.findByBatchId(batch.getBatchName()));
        }
        Map<String, StudyMaterial> unique = new LinkedHashMap<>();
        for (StudyMaterial m : list) {
            if (m != null && m.getId() != null) {
                unique.putIfAbsent(m.getId(), m);
            }
        }
        return new ArrayList<>(unique.values());
    }

    private List<Notice> getNoticesForBatchAndTrainer(Batch batch, String effectiveBatchId, String trainerId) {
        List<Notice> list = new ArrayList<>();
        if (effectiveBatchId != null && !effectiveBatchId.isBlank()) {
            list.addAll(noticeRepository.findByBatchIdAndActiveTrue(effectiveBatchId));
        }
        if (batch != null && batch.getBatchName() != null) {
            list.addAll(noticeRepository.findByBatchIdAndActiveTrue(batch.getBatchName()));
        }
        if (trainerId != null && !trainerId.isBlank()) {
            list.addAll(noticeRepository.findByTrainerId(trainerId));
        }
        list.addAll(noticeRepository.findByActiveTrue());

        Map<String, Notice> unique = new LinkedHashMap<>();
        for (Notice n : list) {
            if (n != null && n.getId() != null) {
                unique.putIfAbsent(n.getId(), n);
            }
        }
        List<Notice> result = new ArrayList<>(unique.values());
        result.sort(Comparator.comparing(Notice::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        return result;
    }

    private List<GuestSession> getGuestSessionsForBatchAndTrainer(Batch batch, String effectiveBatchId, String trainerId) {
        List<GuestSession> list = new ArrayList<>();
        if (effectiveBatchId != null && !effectiveBatchId.isBlank()) {
            list.addAll(guestSessionRepository.findByBatchId(effectiveBatchId));
        }
        if (batch != null && batch.getBatchName() != null) {
            list.addAll(guestSessionRepository.findByBatchId(batch.getBatchName()));
        }
        if (trainerId != null && !trainerId.isBlank()) {
            list.addAll(guestSessionRepository.findByTrainerId(trainerId));
        }
        list.addAll(guestSessionRepository.findByActiveTrue());

        Map<String, GuestSession> unique = new LinkedHashMap<>();
        for (GuestSession gs : list) {
            if (gs != null && gs.getId() != null) {
                unique.putIfAbsent(gs.getId(), gs);
            }
        }
        return new ArrayList<>(unique.values());
    }

    private List<Interview> getInterviewsForBatchAndTrainer(List<Student> students, String trainerId) {
        List<Interview> list = new ArrayList<>();
        if (trainerId != null && !trainerId.isBlank()) {
            list.addAll(interviewRepository.findByTrainerId(trainerId));
        }
        for (Student stu : students) {
            if (stu != null && stu.getId() != null) {
                list.addAll(interviewRepository.findByStudentId(stu.getId()));
            }
        }
        Map<String, Interview> unique = new LinkedHashMap<>();
        for (Interview iv : list) {
            if (iv != null && iv.getId() != null) {
                unique.putIfAbsent(iv.getId(), iv);
            }
        }
        return new ArrayList<>(unique.values());
    }

    private List<TopperResponse> calculateTopPerformers(Batch batch, String batchId, List<Student> students) {
        List<Performance> preCalculated = performanceRepository.findByBatchIdOrderByRankAsc(batchId);
        if (preCalculated.isEmpty() && batch != null && batch.getBatchName() != null) {
            preCalculated = performanceRepository.findByBatchIdOrderByRankAsc(batch.getBatchName());
        }

        if (!preCalculated.isEmpty()) {
            return preCalculated.stream()
                    .map(p -> TopperResponse.builder()
                            .rank(p.getRank())
                            .studentId(p.getStudentId())
                            .studentName(p.getStudentName())
                            .batchId(p.getBatchId())
                            .overallPercentage(p.getOverallPercentage())
                            .performanceStatus(p.getPerformanceStatus() != null ? p.getPerformanceStatus().name() : null)
                            .build())
                    .limit(5)
                    .collect(Collectors.toList());
        }

        List<TopperResponse> calculatedToppers = new ArrayList<>();
        for (Student stu : students) {
            if (stu == null || stu.getId() == null) continue;

            double totalObtained = 0.0;
            double totalMax = 0.0;

            List<AssignmentSubmission> subs = assignmentSubmissionRepository.findByStudentId(stu.getId());
            for (AssignmentSubmission sub : subs) {
                if (sub.getObtainedMarks() != null) {
                    int maxMarks = 100;
                    if (sub.getAssignmentId() != null) {
                        Assignment a = assignmentRepository.findById(sub.getAssignmentId()).orElse(null);
                        if (a != null && a.getTotalMarks() != null && a.getTotalMarks() > 0) {
                            maxMarks = a.getTotalMarks();
                        }
                    }
                    totalObtained += sub.getObtainedMarks();
                    totalMax += maxMarks;
                }
            }

            List<AssessmentResult> results = assessmentResultRepository.findByStudentId(stu.getId());
            for (AssessmentResult res : results) {
                if (res.getObtainedMarks() != null && res.getTotalMarks() != null && res.getTotalMarks() > 0) {
                    totalObtained += res.getObtainedMarks();
                    totalMax += res.getTotalMarks();
                }
            }

            if (totalMax > 0) {
                double pct = Math.round(((totalObtained * 100.0) / totalMax) * 10.0) / 10.0;
                String stuName = ((stu.getFirstName() != null ? stu.getFirstName() : "") + " " +
                                  (stu.getLastName() != null ? stu.getLastName() : "")).trim();
                if (stuName.isEmpty()) {
                    stuName = stu.getEmail() != null ? stu.getEmail() : "Student";
                }

                calculatedToppers.add(TopperResponse.builder()
                        .studentId(stu.getId())
                        .studentName(stuName)
                        .batchId(batchId)
                        .overallPercentage(pct)
                        .performanceStatus(pct >= 85.0 ? "EXCELLENT" : (pct >= 70.0 ? "GOOD" : "AVERAGE"))
                        .build());
            }
        }

        calculatedToppers.sort(Comparator.comparing(TopperResponse::getOverallPercentage, Comparator.nullsLast(Comparator.reverseOrder())));
        int rank = 1;
        for (TopperResponse t : calculatedToppers) {
            t.setRank(rank++);
        }

        return calculatedToppers.stream().limit(5).collect(Collectors.toList());
    }

    private String determineAllowedSessionType(String specialization) {
        if (specialization == null) return "TECHNICAL";
        String s = specialization.toUpperCase();
        if (s.contains("SOFT") || s.contains("COMMUNICATION") || s.contains("BEHAVIORAL")) {
            return "SOFT_SKILL";
        }
        return "TECHNICAL";
    }

    // =========================================================
    // PRIVATE: GET TRAINER
    // =========================================================

    private Trainer getTrainer(String trainerId) {
        if (trainerId == null || trainerId.isBlank()) {
            throw new IllegalArgumentException("Trainer ID is required");
        }

        return trainerRepository.findById(trainerId)
                .or(() -> trainerRepository.findByEmail(trainerId))
                .orElseThrow(() ->
                        new RuntimeException("Trainer not found with id/email : " + trainerId));
    }
}