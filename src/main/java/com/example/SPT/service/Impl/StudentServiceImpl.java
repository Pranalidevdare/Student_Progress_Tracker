package com.example.SPT.service.Impl;
import com.example.SPT.exception.ResourceNotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.SPT.dto.request.StudentRequest;
import com.example.SPT.dto.request.StudentUpdateRequest;
import com.example.SPT.dto.response.GuestSessionResponse;
import com.example.SPT.dto.response.InterviewResponse;
import com.example.SPT.dto.response.NoticeResponse;
import com.example.SPT.dto.response.StudentDashboardResponse;
import com.example.SPT.dto.response.StudentResponse;
import com.example.SPT.entity.Assignment;
import com.example.SPT.entity.Interview;
import com.example.SPT.entity.Performance;
import com.example.SPT.entity.SelectionStatus;
import com.example.SPT.entity.Student;
import com.example.SPT.entity.StudyMaterial;
import com.example.SPT.mapper.GuestSessionMapper;
import com.example.SPT.mapper.InterviewMapper;
import com.example.SPT.mapper.NoticeMapper;
import com.example.SPT.mapper.StudentMapper;
import com.example.SPT.repository.AssessmentResultRepository;
import com.example.SPT.repository.AssignmentRepository;
import com.example.SPT.repository.AssignmentSubmissionRepository;
import com.example.SPT.repository.GuestSessionRepository;
import com.example.SPT.repository.InterviewRepository;
import com.example.SPT.enums.Role;
import com.example.SPT.entity.User;
import com.example.SPT.exception.ResourceNotFoundException;
import com.example.SPT.repository.NoticeRepository;
import com.example.SPT.repository.PerformanceRepository;
import com.example.SPT.repository.StudentRepository;
import com.example.SPT.repository.StudyMaterialRepository;
import com.example.SPT.repository.UserRepository;
import com.example.SPT.dto.response.TopperResponse;
import com.example.SPT.entity.AssessmentResult;
import com.example.SPT.entity.Attendance;
import com.example.SPT.repository.AttendanceRepository;
import com.example.SPT.service.SequenceGeneratorService;
import com.example.SPT.service.StudentService;
import com.example.SPT.entity.Batch;
import com.example.SPT.repository.BatchRepository;
import com.example.SPT.entity.AssignmentSubmission;
import com.example.SPT.exception.DuplicateResourceException;
import java.util.LinkedHashMap;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;

    private final UserRepository userRepository;

    private final StudentMapper studentMapper;

    private final PerformanceRepository performanceRepository;

    private final AssignmentRepository assignmentRepository;

    private final AssessmentResultRepository assessmentRepository;

    private final StudyMaterialRepository materialRepository;

    private final NoticeRepository noticeRepository;

    private final GuestSessionRepository guestSessionRepository;

    private final AssignmentSubmissionRepository assignmentSubmissionRepository;

    private final InterviewRepository interviewRepository;

    private final AttendanceRepository attendanceRepository;

    private final BatchRepository batchRepository;

    private final SequenceGeneratorService sequenceGeneratorService;

    private final NoticeMapper noticeMapper;

    private final GuestSessionMapper guestSessionMapper;

    private final InterviewMapper interviewMapper;


    // =========================================================
    // REGISTER STUDENT
    // =========================================================

    @Override
    public StudentResponse registerStudent(StudentRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Student request cannot be null");
        }

        if (request.getEmail() == null
                || request.getEmail().isBlank()) {

            throw new IllegalArgumentException(
                    "Email is required");
        }

        if (studentRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Student already exists with email: " + request.getEmail());
        }

        Student student = studentMapper.toEntity(request);
        if (student.getStudentId() == null || student.getStudentId().isBlank()) {
            student.setStudentId(generateNextStudentId());
        }

        if (student.getBatchId() != null && !student.getBatchId().isBlank() && batchRepository != null) {
            batchRepository.findById(student.getBatchId())
                    .or(() -> batchRepository.findByBatchName(student.getBatchId()))
                    .ifPresent(b -> student.setBatchName(b.getBatchName()));
        }

        student.setActive(true);
        student.setCreatedAt(LocalDateTime.now());
        student.setUpdatedAt(LocalDateTime.now());

        Student savedStudent = studentRepository.save(student);

        return studentMapper.toResponse(savedStudent);
    }


    // =========================================================
    // GET STUDENT BY ID
    // =========================================================

    @Override
    public StudentResponse getStudentById(String id) {

        Student student =
                getStudent(id);

        return studentMapper.toResponse(
                student);
    }

    @Override
    public StudentResponse getCurrentStudent(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Authentication email is required");
        }
        System.out.println("Searching student by email: " + email);
        Student student = studentRepository.findByEmail(email)
                .or(() -> studentRepository.findByEmail(email.toLowerCase()))
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for email: " + email));

        System.out.println("Found student Mongo ID: " + student.getId());
        return studentMapper.toResponse(student);
    }

    @Override
    public StudentResponse updateCurrentStudent(String email, StudentUpdateRequest request) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Authentication email is required");
        }
        if (request == null) {
            throw new IllegalArgumentException("Student update request cannot be null");
        }
        System.out.println("Updating student by email: " + email);
        Student student = studentRepository.findByEmail(email)
                .or(() -> studentRepository.findByEmail(email.toLowerCase()))
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for email: " + email));

        System.out.println("Found student Mongo ID to update: " + student.getId());

        if (request.getFirstName() != null) student.setFirstName(request.getFirstName().trim());
        if (request.getLastName() != null) student.setLastName(request.getLastName().trim());
        if (request.getMobile() != null) student.setMobile(request.getMobile());
        if (request.getDateOfBirth() != null) student.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) student.setGender(request.getGender());
        if (request.getCollegeName() != null) student.setCollegeName(request.getCollegeName());
        if (request.getDegree() != null) student.setDegree(request.getDegree());
        if (request.getBranch() != null) student.setBranch(request.getBranch());
        if (request.getPassingYear() != null) student.setPassingYear(request.getPassingYear());
        if (request.getCgpa() != null) student.setCgpa(request.getCgpa());
        if (request.getProfileImage() != null) student.setProfileImage(request.getProfileImage());

        student.setUpdatedAt(LocalDateTime.now());

        Student updatedStudent = studentRepository.save(student);
        return studentMapper.toResponse(updatedStudent);
    }


    // =========================================================
    // GET ALL STUDENTS
    // =========================================================

    @Override
    public List<StudentResponse> getAllStudents() {

        return studentRepository.findAll()
                .stream()
                .map(studentMapper::toResponse)
                .collect(Collectors.toList());
    }


    // =========================================================
    // UPDATE STUDENT
    // =========================================================

    @Override
    public StudentResponse updateStudent(
            String identifier,
            StudentUpdateRequest request) {

        if (identifier == null || identifier.isBlank()) {
            throw new IllegalArgumentException(
                    "Student identifier is required");
        }

        if (request == null) {
            throw new IllegalArgumentException(
                    "Student update request cannot be null");
        }

        /*
         * Resolve the actual Student document.
         *
         * identifier can be:
         * 1. MongoDB Student _id
         * 2. Student ID such as STU001
         * 3. Student email
         */
        Student student = resolveStudent(identifier);

        /*
         * Update ONLY editable profile fields.
         *
         * Email, studentId and batchId are intentionally NOT updated.
         */
        student.setFirstName(
                request.getFirstName());

        student.setLastName(
                request.getLastName());

        student.setMobile(
                request.getMobile());

        student.setDateOfBirth(
                request.getDateOfBirth());

        student.setGender(
                request.getGender());

        student.setCollegeName(
                request.getCollegeName());

        student.setDegree(
                request.getDegree());

        student.setBranch(
                request.getBranch());

        student.setPassingYear(
                request.getPassingYear());

        student.setCgpa(
                request.getCgpa());

        student.setProfileImage(
                request.getProfileImage());

        student.setUpdatedAt(
                LocalDateTime.now());

        /*
         * Save the SAME existing Student document.
         */
        Student updatedStudent =
                studentRepository.save(student);

        return studentMapper.toResponse(updatedStudent);
    }
    /**
     * Resolves a Student using MongoDB _id, studentId or email.
     */
    private Student resolveStudent(String identifier) {

        /*
         * First try MongoDB _id.
         */
        Optional<Student> studentByMongoId =
                studentRepository.findById(identifier);

        if (studentByMongoId.isPresent()) {
            return studentByMongoId.get();
        }

        /*
         * Second try system Student ID.
         * Example: STU001
         */
        Optional<Student> studentByStudentId =
                studentRepository.findByStudentId(identifier);

        if (studentByStudentId.isPresent()) {
            return studentByStudentId.get();
        }

        /*
         * Third try email.
         */
        Optional<Student> studentByEmail =
                studentRepository.findByEmail(identifier);

        if (studentByEmail.isPresent()) {
            return studentByEmail.get();
        }

        throw new ResourceNotFoundException(
                "Student not found for identifier: " + identifier);
    }
    // =========================================================
    // DELETE STUDENT
    // =========================================================

    @Override
    public void deleteStudent(String id) {

        Student student =
                getStudent(id);

        studentRepository.delete(student);
    }


    // =========================================================
    // STUDENT DASHBOARD
    // =========================================================

    @Override
    public StudentDashboardResponse getStudentDashboard(String studentId) {

        Student student = getStudent(studentId);
        StudentResponse studentResponse = studentMapper.toResponse(student);

        // 1. Batch Metadata Resolution
        String rawBatchId = student.getBatchId();
        String batchName = "No batch assigned";
        String courseName = null;
        Batch resolvedBatch = null;

        if (rawBatchId != null && !rawBatchId.isBlank()) {
            resolvedBatch = batchRepository.findById(rawBatchId)
                    .or(() -> batchRepository.findByBatchName(rawBatchId))
                    .orElse(null);

            if (resolvedBatch != null) {
                batchName = resolvedBatch.getBatchName();
                courseName = resolvedBatch.getCourseName();
            } else if (student.getBatchName() != null && !student.getBatchName().isBlank()) {
                batchName = student.getBatchName();
            } else {
                batchName = "Batch " + rawBatchId;
            }
        }

        StudentDashboardResponse.BatchInfo batchInfo = StudentDashboardResponse.BatchInfo.builder()
                .id(rawBatchId)
                .name(batchName)
                .courseName(courseName)
                .build();

        studentResponse.setBatchName(batchName);
        studentResponse.setCourseName(courseName);

        // 2. Attendance Analytics
        List<Attendance> attendances = new ArrayList<>();
        if (student.getId() != null) {
            attendances.addAll(attendanceRepository.findByStudentId(student.getId()));
        }
        if (student.getStudentId() != null) {
            List<Attendance> bySid = attendanceRepository.findByStudentId(student.getStudentId());
            for (Attendance a : bySid) {
                if (attendances.stream().noneMatch(x -> x.getId() != null && x.getId().equals(a.getId()))) {
                    attendances.add(a);
                }
            }
        }
        if (student.getEmail() != null) {
            List<Attendance> byEmail = attendanceRepository.findByStudentId(student.getEmail());
            for (Attendance a : byEmail) {
                if (attendances.stream().noneMatch(x -> x.getId() != null && x.getId().equals(a.getId()))) {
                    attendances.add(a);
                }
            }
        }

        int presentDays = 0;
        int absentDays = 0;
        for (Attendance att : attendances) {
            if (att.getStatus() != null) {
                String st = att.getStatus().toUpperCase();
                if (st.equals("PRESENT") || st.equals("LATE")) {
                    presentDays++;
                } else if (st.equals("ABSENT") || st.equals("LEAVE")) {
                    absentDays++;
                }
            }
        }
        int totalAttendanceDays = presentDays + absentDays;
        double attendancePercentage = totalAttendanceDays > 0
                ? Math.round(((double) presentDays * 100.0 / totalAttendanceDays) * 10.0) / 10.0
                : 0.0;

        // 3. Assignment Analytics
        long totalAssignments = 0;
        if (rawBatchId != null && !rawBatchId.isBlank()) {
            totalAssignments = assignmentRepository.countByBatchId(rawBatchId);
            if (totalAssignments == 0) {
                List<Assignment> batchAss = assignmentRepository.findByBatchId(rawBatchId);
                totalAssignments = (batchAss != null) ? batchAss.size() : 0;
            }
        }

        List<AssignmentSubmission> submissions = new ArrayList<>();
        if (student.getId() != null) {
            submissions.addAll(assignmentSubmissionRepository.findByStudentId(student.getId()));
        }
        if (student.getStudentId() != null) {
            List<AssignmentSubmission> bySid = assignmentSubmissionRepository.findByStudentId(student.getStudentId());
            for (AssignmentSubmission s : bySid) {
                if (submissions.stream().noneMatch(x -> x.getId() != null && x.getId().equals(s.getId()))) {
                    submissions.add(s);
                }
            }
        }

        long completedAssignments = submissions.stream().filter(s -> {
            String st = s.getStatus() != null ? s.getStatus().toUpperCase() : "";
            String subSt = s.getSubmissionStatus() != null ? s.getSubmissionStatus().toUpperCase() : "";
            return st.equals("COMPLETED") || st.equals("EVALUATED") || subSt.equals("SUBMITTED") || st.equals("SUBMITTED");
        }).count();

        long pendingAssignments = Math.max(0, totalAssignments - completedAssignments);
        double assignmentCompletionPct = totalAssignments > 0
                ? Math.round(((double) completedAssignments * 100.0 / totalAssignments) * 10.0) / 10.0
                : 0.0;

        // 4. Assessment & Trend Analytics
        List<AssessmentResult> results = new ArrayList<>();
        if (student.getId() != null) {
            results.addAll(assessmentRepository.findByStudentId(student.getId()));
        }
        if (student.getStudentId() != null) {
            List<AssessmentResult> bySid = assessmentRepository.findByStudentId(student.getStudentId());
            for (AssessmentResult r : bySid) {
                if (results.stream().noneMatch(x -> x.getId() != null && x.getId().equals(r.getId()))) {
                    results.add(r);
                }
            }
        }

        List<StudentDashboardResponse.AssessmentTrendPoint> trendPoints = new ArrayList<>();
        double sumAssessment = 0.0;
        if (!results.isEmpty()) {
            results.sort(Comparator.comparing(r -> r.getSubmittedAt() != null ? r.getSubmittedAt() : (r.getCreatedAt() != null ? r.getCreatedAt() : LocalDateTime.MIN)));
            for (int i = 0; i < results.size(); i++) {
                AssessmentResult r = results.get(i);
                double score = 0.0;
                if (r.getPercentage() != null) {
                    score = r.getPercentage();
                } else if (r.getTotalMarks() != null && r.getTotalMarks() > 0 && r.getObtainedMarks() != null) {
                    score = (r.getObtainedMarks() * 100.0) / r.getTotalMarks();
                }
                score = Math.round(score * 10.0) / 10.0;
                sumAssessment += score;
                String title = r.getAssessmentTitle() != null ? r.getAssessmentTitle() : ("Assessment " + (i + 1));
                String dt = r.getSubmittedAt() != null ? r.getSubmittedAt().toString().substring(0, 10) : (r.getCreatedAt() != null ? r.getCreatedAt().toString().substring(0, 10) : "2026-08-01");
                trendPoints.add(StudentDashboardResponse.AssessmentTrendPoint.builder()
                        .title(title)
                        .score(score)
                        .date(dt)
                        .build());
            }
        }

        long totalAssessments = results.size();
        double assessmentPercentage = totalAssessments > 0
                ? Math.round((sumAssessment / totalAssessments) * 10.0) / 10.0
                : 0.0;

        String trendStatus = "Stable";
        if (trendPoints.size() >= 2) {
            double firstScore = trendPoints.get(0).getScore();
            double lastScore = trendPoints.get(trendPoints.size() - 1).getScore();
            if (lastScore - firstScore >= 3.0) {
                trendStatus = "Improving";
            } else if (firstScore - lastScore >= 3.0) {
                trendStatus = "Needs Attention";
            }
        }

        // 5. Subject Performance Breakdown
        List<StudentDashboardResponse.SubjectPerformancePoint> subjectPoints = new ArrayList<>();
        if (!results.isEmpty()) {
            Map<String, List<Double>> subjectMap = new LinkedHashMap<>();
            for (AssessmentResult r : results) {
                String subj = "General";
                if (r.getAssessmentTitle() != null) {
                    String t = r.getAssessmentTitle().toLowerCase();
                    if (t.contains("java")) subj = "Java & OOP";
                    else if (t.contains("sql") || t.contains("db")) subj = "SQL & Databases";
                    else if (t.contains("dsa") || t.contains("algo")) subj = "DSA";
                    else if (t.contains("aptitude")) subj = "Aptitude";
                    else if (t.contains("react") || t.contains("web") || t.contains("frontend")) subj = "Frontend & React";
                    else if (t.contains("spring") || t.contains("backend")) subj = "Spring Boot & Backend";
                    else subj = r.getAssessmentTitle();
                }
                double sc = r.getPercentage() != null ? r.getPercentage() : (r.getTotalMarks() != null && r.getTotalMarks() > 0 && r.getObtainedMarks() != null ? (r.getObtainedMarks() * 100.0 / r.getTotalMarks()) : 0.0);
                subjectMap.computeIfAbsent(subj, k -> new ArrayList<>()).add(sc);
            }
            for (Map.Entry<String, List<Double>> entry : subjectMap.entrySet()) {
                double avg = entry.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                subjectPoints.add(StudentDashboardResponse.SubjectPerformancePoint.builder()
                        .subject(entry.getKey())
                        .score(Math.round(avg * 10.0) / 10.0)
                        .totalAssessments(entry.getValue().size())
                        .build());
            }
        }

        // 6. Overall Performance & Batch Standings
        Performance manualPerf = performanceRepository.findByStudentId(student.getId())
                .or(() -> performanceRepository.findByStudentId(student.getStudentId()))
                .orElse(null);

        double overallPerformance = 0.0;
        if (manualPerf != null && manualPerf.getOverallPercentage() != null) {
            overallPerformance = manualPerf.getOverallPercentage();
        } else {
            double weightedSum = 0.0;
            double totalWeight = 0.0;
            if (totalAttendanceDays > 0) {
                weightedSum += attendancePercentage * 0.25;
                totalWeight += 0.25;
            }
            if (totalAssignments > 0) {
                weightedSum += assignmentCompletionPct * 0.25;
                totalWeight += 0.25;
            }
            if (totalAssessments > 0) {
                weightedSum += assessmentPercentage * 0.30;
                totalWeight += 0.30;
            }
            overallPerformance = totalWeight > 0
                    ? Math.round((weightedSum / totalWeight) * 10.0) / 10.0
                    : 0.0;
        }

        String performanceStatus = "EVALUATING";
        if (overallPerformance >= 85.0) performanceStatus = "EXCELLENT";
        else if (overallPerformance >= 70.0) performanceStatus = "GOOD";
        else if (overallPerformance >= 50.0) performanceStatus = "AVERAGE";
        else if (overallPerformance > 0.0) performanceStatus = "NEEDS_IMPROVEMENT";

        // Real Batch Ranking & Leaderboard
        List<Student> batchStudents = (rawBatchId != null && !rawBatchId.isBlank())
                ? studentRepository.findByBatchId(rawBatchId)
                : List.of(student);

        if (batchStudents == null || batchStudents.isEmpty()) {
            batchStudents = List.of(student);
        }

        int totalBatchStudents = batchStudents.size();

        class StudentRankHolder {
            String id;
            String studentId;
            String name;
            String batchId;
            double score;
            String status;
            int rank;
        }

        List<StudentRankHolder> rankHolders = new ArrayList<>();
        for (Student st : batchStudents) {
            StudentRankHolder h = new StudentRankHolder();
            h.id = st.getId();
            h.studentId = st.getStudentId() != null ? st.getStudentId() : st.getId();
            String stName = (st.getFirstName() != null ? st.getFirstName() : "") + " " + (st.getLastName() != null ? st.getLastName() : "");
            h.name = stName.trim().isEmpty() ? "Student" : stName.trim();
            h.batchId = st.getBatchId();

            Performance p = null;
            if (st.getId() != null) {
                p = performanceRepository.findByStudentId(st.getId()).orElse(null);
            }
            if (p == null && st.getStudentId() != null && !st.getStudentId().isBlank()) {
                p = performanceRepository.findByStudentId(st.getStudentId()).orElse(null);
            }

            if (p != null && p.getOverallPercentage() != null) {
                h.score = p.getOverallPercentage();
            } else if (st.getId().equals(student.getId()) || (st.getStudentId() != null && st.getStudentId().equals(student.getStudentId()))) {
                h.score = overallPerformance;
            } else {
                List<AssessmentResult> stResults = (st.getId() != null) ? assessmentRepository.findByStudentId(st.getId()) : null;
                double stAssScore = (stResults != null && !stResults.isEmpty())
                        ? stResults.stream().mapToDouble(r -> r.getPercentage() != null ? r.getPercentage() : 0.0).average().orElse(0.0)
                        : 0.0;
                h.score = Math.round(stAssScore * 10.0) / 10.0;
            }

            if (h.score >= 85.0) h.status = "EXCELLENT";
            else if (h.score >= 70.0) h.status = "GOOD";
            else if (h.score >= 50.0) h.status = "AVERAGE";
            else if (h.score > 0.0) h.status = "NEEDS_IMPROVEMENT";
            else h.status = "EVALUATING";

            rankHolders.add(h);
        }

        rankHolders.sort((a, b) -> {
            int cmp = Double.compare(b.score, a.score);
            if (cmp != 0) return cmp;
            return a.name.compareToIgnoreCase(b.name);
        });

        int currentRank = 1;
        List<TopperResponse> batchLeaderboard = new ArrayList<>();
        for (int i = 0; i < rankHolders.size(); i++) {
            StudentRankHolder h = rankHolders.get(i);
            h.rank = i + 1;
            if (h.id.equals(student.getId()) || (student.getStudentId() != null && student.getStudentId().equals(h.studentId))) {
                currentRank = h.rank;
            }
            batchLeaderboard.add(TopperResponse.builder()
                    .id(h.id)
                    .rank(h.rank)
                    .studentId(h.studentId)
                    .studentName(h.name)
                    .batchId(h.batchId != null ? h.batchId : rawBatchId)
                    .overallPercentage(h.score)
                    .performanceStatus(h.status)
                    .build());
        }

        // 7. Study Materials, Notices, Guest Sessions, Interview
        long totalStudyMaterials = 0;
        if (rawBatchId != null && !rawBatchId.isBlank()) {
            totalStudyMaterials = materialRepository.countByBatchId(rawBatchId);
            if (totalStudyMaterials == 0) {
                List<StudyMaterial> allMats = materialRepository.findAll();
                for (StudyMaterial m : allMats) {
                    if (m.getBatchId() != null && m.getBatchId().equalsIgnoreCase(rawBatchId)) {
                        totalStudyMaterials++;
                    }
                }
            }
        }

        List<NoticeResponse> latestNotices = noticeRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(notice -> notice.getActive() != null && notice.getActive())
                .filter(notice -> rawBatchId == null || notice.getBatchId() == null || rawBatchId.equals(notice.getBatchId()))
                .limit(5)
                .map(noticeMapper::toResponse)
                .toList();

        List<GuestSessionResponse> guestSessions = List.of();
        if (rawBatchId != null && !rawBatchId.isBlank()) {
            guestSessions = guestSessionRepository.findByBatchIdAndActiveTrue(rawBatchId)
                    .stream()
                    .map(guestSessionMapper::toResponse)
                    .toList();
        }

        InterviewResponse interviewResponse = getLatestInterview(studentId);
        String resolvedStudentName = ((student.getFirstName() != null ? student.getFirstName() : "") + " " + (student.getLastName() != null ? student.getLastName() : "")).trim();
        if (resolvedStudentName.isEmpty()) resolvedStudentName = "Student";

        return StudentDashboardResponse.builder()
                .student(studentResponse)
                .studentId(student.getStudentId() != null ? student.getStudentId() : student.getId())
                .studentName(resolvedStudentName)
                .email(student.getEmail())
                .batchId(rawBatchId)
                .batchName(batchName)
                .courseName(courseName)
                .batch(batchInfo)
                .attendancePercentage(attendancePercentage)
                .presentDays(presentDays)
                .absentDays(absentDays)
                .totalAttendanceDays(totalAttendanceDays)
                .totalAssignments(toInt(totalAssignments))
                .completedAssignments(toInt(completedAssignments))
                .pendingAssignments(toInt(pendingAssignments))
                .assignmentCompletionPercentage(assignmentCompletionPct)
                .totalAssessments(toInt(totalAssessments))
                .assessmentPercentage(assessmentPercentage)
                .averageAssessment(assessmentPercentage)
                .overallPerformance(overallPerformance)
                .currentRank(currentRank)
                .batchRank(currentRank)
                .totalBatchStudents(totalBatchStudents)
                .batchSize(totalBatchStudents)
                .performanceStatus(performanceStatus)
                .trendStatus(trendStatus)
                .performanceTrend(trendPoints)
                .subjectPerformance(subjectPoints)
                .batchLeaderboard(batchLeaderboard)
                .totalStudyMaterials(toInt(totalStudyMaterials))
                .latestNotices(latestNotices)
                .guestSessions(guestSessions)
                .upcomingInterview(interviewResponse)
                .build();
    }


    public synchronized String generateNextStudentId() {
        if (sequenceGeneratorService != null) {
            long seq = sequenceGeneratorService.generateSequence("STUDENT_SEQUENCE");
            String candidate = String.format("STU%03d", seq);
            if (studentRepository.existsById(candidate)) {
                List<Student> allStudents = studentRepository.findAll();
                long maxSeq = 0;
                for (Student s : allStudents) {
                    String sId = s.getStudentId();
                    if (sId != null && sId.toUpperCase().startsWith("STU")) {
                        try {
                            String numPart = sId.substring(3).replaceAll("\\D", "");
                            if (!numPart.isEmpty()) {
                                long num = Long.parseLong(numPart);
                                if (num > maxSeq) {
                                    maxSeq = num;
                                }
                            }
                        } catch (Exception ignored) {}
                    }
                }
                return String.format("STU%03d", maxSeq + 1);
            }
            return candidate;
        }

        List<Student> allStudents = studentRepository.findAll();
        int maxSeq = 0;
        for (Student s : allStudents) {
            String sId = s.getStudentId();
            if (sId != null && sId.toUpperCase().startsWith("STU")) {
                try {
                    String numPart = sId.substring(3).replaceAll("\\D", "");
                    if (!numPart.isEmpty()) {
                        int num = Integer.parseInt(numPart);
                        if (num > maxSeq) {
                            maxSeq = num;
                        }
                    }
                } catch (Exception ignored) {}
            }
        }
        return String.format("STU%03d", maxSeq + 1);
    }

    private Student getStudent(
            String studentId) {

        if (studentId == null
                || studentId.isBlank()) {

            throw new IllegalArgumentException(
                    "Student ID is required");
        }

        Student student = studentRepository.findById(studentId)
                .or(() -> studentRepository.findByStudentId(studentId))
                .or(() -> studentRepository.findByEmail(studentId))
                .orElse(null);

        if (student == null && userRepository != null) {
            User user = userRepository.findByEmail(studentId)
                    .or(() -> userRepository.findById(studentId))
                    .orElse(null);

            if (user != null) {
                if (user.getEmail() != null) {
                    student = studentRepository.findByEmail(user.getEmail())
                            .or(() -> studentRepository.findByEmail(user.getEmail().toLowerCase()))
                            .orElse(null);
                }

                if (student == null && (user.getRole() == Role.STUDENT || "STUDENT".equalsIgnoreCase(String.valueOf(user.getRole())))) {
                    String[] parts = (user.getFullName() != null ? user.getFullName() : "Student User").trim().split(" ");
                    student = Student.builder()
                            .firstName(parts[0])
                            .lastName(parts.length > 1 ? parts[parts.length - 1] : "")
                            .email(user.getEmail())
                            .mobile(user.getPhone())
                            .active(true)
                            .selectionStatus(SelectionStatus.SELECTED)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();
                }
            }
        }

        if (student == null) {
            throw new ResourceNotFoundException("Student not found with identifier: " + studentId);
        }

        if (student.getStudentId() == null || student.getStudentId().isBlank()) {
            student.setStudentId(generateNextStudentId());
            student = studentRepository.save(student);
        }

        return student;
    }


    // =========================================================
    // GET LATEST INTERVIEW
    // =========================================================

    private InterviewResponse getLatestInterview(
            String studentId) {

        List<Interview> interviews =
                interviewRepository
                        .findByStudentId(studentId);

        if (interviews == null
                || interviews.isEmpty()) {

            return null;
        }

        Interview latestInterview =
                interviews.stream()
                        .max(
                                (first, second) ->
                                        compareDate(
                                                first.getUpdatedAt(),
                                                second.getUpdatedAt()))
                        .orElse(null);

        return interviewMapper.toResponse(
                latestInterview);
    }


    // =========================================================
    // SAFE INTEGER CONVERSION
    // =========================================================

    private int toInt(long value) {

        if (value > Integer.MAX_VALUE) {
            return Integer.MAX_VALUE;
        }

        return (int) value;
    }


    // =========================================================
    // COMPARE LOCAL DATE TIME
    // =========================================================

    private int compareDate(
            LocalDateTime first,
            LocalDateTime second) {

        if (first == null
                && second == null) {

            return 0;
        }

        if (first == null) {
            return -1;
        }

        if (second == null) {
            return 1;
        }

        return first.compareTo(second);
    }
}