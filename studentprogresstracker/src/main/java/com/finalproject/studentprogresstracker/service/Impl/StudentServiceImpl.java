package com.finalproject.studentprogresstracker.service.Impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.finalproject.studentprogresstracker.dto.request.StudentRequest;
import com.finalproject.studentprogresstracker.dto.request.StudentUpdateRequest;
import com.finalproject.studentprogresstracker.dto.response.GuestSessionResponse;
import com.finalproject.studentprogresstracker.dto.response.InterviewResponse;
import com.finalproject.studentprogresstracker.dto.response.NoticeResponse;
import com.finalproject.studentprogresstracker.dto.response.StudentDashboardResponse;
import com.finalproject.studentprogresstracker.dto.response.StudentResponse;
import com.finalproject.studentprogresstracker.entity.Interview;
import com.finalproject.studentprogresstracker.entity.Performance;
import com.finalproject.studentprogresstracker.entity.SelectionStatus;
import com.finalproject.studentprogresstracker.entity.Student;
import com.finalproject.studentprogresstracker.mapper.GuestSessionMapper;
import com.finalproject.studentprogresstracker.mapper.InterviewMapper;
import com.finalproject.studentprogresstracker.mapper.NoticeMapper;
import com.finalproject.studentprogresstracker.mapper.StudentMapper;
import com.finalproject.studentprogresstracker.repository.AssessmentResultRepository;
import com.finalproject.studentprogresstracker.repository.AssignmentRepository;
import com.finalproject.studentprogresstracker.repository.AssignmentSubmissionRepository;
import com.finalproject.studentprogresstracker.repository.GuestSessionRepository;
import com.finalproject.studentprogresstracker.repository.InterviewRepository;
import com.finalproject.studentprogresstracker.repository.NoticeRepository;
import com.finalproject.studentprogresstracker.repository.PerformanceRepository;
import com.finalproject.studentprogresstracker.repository.StudentRepository;
import com.finalproject.studentprogresstracker.repository.StudyMaterialRepository;
import com.finalproject.studentprogresstracker.service.StudentService;

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

    private final AssignmentSubmissionRepository assignmentSubmissionRepository;

    private final InterviewRepository interviewRepository;

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

            throw new RuntimeException(
                    "Student already exists with email: "
                            + request.getEmail());
        }

        Student student =
                studentMapper.toEntity(request);

        student.setActive(true);

        /*
         * New candidate always starts from
         * aptitude pending.
         */
        student.setSelectionStatus(
                SelectionStatus.APTITUDE_PENDING);

        LocalDateTime now =
                LocalDateTime.now();

        student.setCreatedAt(now);
        student.setUpdatedAt(now);

        Student savedStudent =
                studentRepository.save(student);

        return studentMapper.toResponse(
                savedStudent);
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
            String id,
            StudentUpdateRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Student update request cannot be null");
        }

        Student student =
                getStudent(id);

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

        Student updatedStudent =
                studentRepository.save(student);

        return studentMapper.toResponse(
                updatedStudent);
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
    public StudentDashboardResponse getStudentDashboard(
            String studentId) {

        // -----------------------------------------------------
        // 1. Student
        // -----------------------------------------------------

        Student student =
                getStudent(studentId);

        StudentResponse studentResponse =
                studentMapper.toResponse(student);


        // -----------------------------------------------------
        // 2. Performance
        // -----------------------------------------------------

        Performance performance =
                performanceRepository
                        .findByStudentId(studentId)
                        .orElse(null);

        double attendancePercentage = 0.0;

        double assessmentPercentage = 0.0;

        double overallPerformance = 0.0;

        int currentRank = 0;

        String performanceStatus = "";


        if (performance != null) {

            if (performance.getAttendancePercentage()
                    != null) {

                attendancePercentage =
                        performance
                                .getAttendancePercentage();
            }

            if (performance.getAssessmentPercentage()
                    != null) {

                assessmentPercentage =
                        performance
                                .getAssessmentPercentage();
            }

            if (performance.getOverallPercentage()
                    != null) {

                overallPerformance =
                        performance
                                .getOverallPercentage();
            }

            if (performance.getRank() != null) {

                currentRank =
                        performance.getRank();
            }

            if (performance.getPerformanceStatus()
                    != null) {

                performanceStatus =
                        performance
                                .getPerformanceStatus()
                                .toString();
            }
        }


        // -----------------------------------------------------
        // 3. Assignment counts
        // -----------------------------------------------------

        long totalAssignments = 0;

        long completedAssignments = 0;

        long pendingAssignments = 0;


        if (student.getBatchId() != null
                && !student.getBatchId().isBlank()) {

            totalAssignments =
                    assignmentRepository
                            .countByBatchId(
                                    student.getBatchId());
        }


        completedAssignments =
                assignmentSubmissionRepository
                        .countByStudentIdAndStatus(
                                studentId,
                                "COMPLETED");


        pendingAssignments =
                Math.max(
                        0,
                        totalAssignments
                                - completedAssignments);


        // -----------------------------------------------------
        // 4. Assessments
        // -----------------------------------------------------

        long totalAssessments =
                assessmentRepository
                        .countByStudentId(
                                studentId);


        // -----------------------------------------------------
        // 5. Study materials
        // -----------------------------------------------------

        long totalStudyMaterials = 0;

        if (student.getBatchId() != null
                && !student.getBatchId().isBlank()) {

            totalStudyMaterials =
                    materialRepository
                            .countByBatchId(
                                    student.getBatchId());
        }


        // -----------------------------------------------------
        // 6. Latest notices
        // -----------------------------------------------------

        List<NoticeResponse> latestNotices =
                noticeRepository
                        .findAllByOrderByCreatedAtDesc()
                        .stream()
                        .filter(notice ->
                                notice.getActive() != null
                                        && notice.getActive())
                        .filter(notice ->
                                student.getBatchId() == null
                                        || notice.getBatchId() == null
                                        || student.getBatchId()
                                                .equals(
                                                        notice.getBatchId()))
                        .limit(5)
                        .map(noticeMapper::toResponse)
                        .toList();


        // -----------------------------------------------------
        // 7. Guest sessions
        // -----------------------------------------------------

        List<GuestSessionResponse> guestSessions =
                List.of();

        if (student.getBatchId() != null
                && !student.getBatchId().isBlank()) {

            guestSessions =
                    guestSessionRepository
                            .findByBatchIdAndActiveTrue(
                                    student.getBatchId())
                            .stream()
                            .map(
                                    guestSessionMapper
                                            ::toResponse)
                            .toList();
        }


        // -----------------------------------------------------
        // 8. Latest / current interview
        // -----------------------------------------------------

        InterviewResponse interviewResponse =
                getLatestInterview(studentId);


        // -----------------------------------------------------
        // 9. Build dashboard
        // -----------------------------------------------------

        return StudentDashboardResponse.builder()

                .student(studentResponse)

                .attendancePercentage(
                        attendancePercentage)

                .totalAssignments(
                        toInt(totalAssignments))

                .completedAssignments(
                        toInt(completedAssignments))

                .pendingAssignments(
                        toInt(pendingAssignments))

                .totalAssessments(
                        toInt(totalAssessments))

                .assessmentPercentage(
                        assessmentPercentage)

                .overallPerformance(
                        overallPerformance)

                .currentRank(
                        currentRank)

                .performanceStatus(
                        performanceStatus)

                .totalStudyMaterials(
                        toInt(totalStudyMaterials))

                .latestNotices(
                        latestNotices)

                .guestSessions(
                        guestSessions)

                .upcomingInterview(
                        interviewResponse)

                .build();
    }


    // =========================================================
    // GET STUDENT
    // =========================================================

    private Student getStudent(
            String studentId) {

        if (studentId == null
                || studentId.isBlank()) {

            throw new IllegalArgumentException(
                    "Student ID is required");
        }

        return studentRepository
                .findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Student not found with id: "
                                        + studentId));
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