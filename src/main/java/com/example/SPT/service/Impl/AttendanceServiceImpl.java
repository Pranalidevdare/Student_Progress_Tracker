package com.example.SPT.service.Impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.example.SPT.dto.request.AttendanceRequest;
import com.example.SPT.dto.request.BulkAttendanceRequest;
import com.example.SPT.dto.response.AttendanceResponse;
import com.example.SPT.dto.response.StudentAttendanceDetailResponse;
import com.example.SPT.dto.response.StudentMonthlyAttendanceResponse;
import com.example.SPT.dto.response.TodayAttendanceResponse;
import com.example.SPT.entity.Attendance;
import com.example.SPT.entity.Batch;
import com.example.SPT.entity.Student;
import com.example.SPT.entity.Trainer;
import com.example.SPT.entity.User;
import com.example.SPT.enums.Role;
import com.example.SPT.enums.TrainerType;
import com.example.SPT.exception.ResourceNotFoundException;
import com.example.SPT.mapper.AttendanceMapper;
import com.example.SPT.repository.AttendanceRepository;
import com.example.SPT.repository.BatchRepository;
import com.example.SPT.repository.StudentRepository;
import com.example.SPT.repository.TrainerRepository;
import com.example.SPT.repository.UserRepository;
import com.example.SPT.service.AttendanceService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service("attendanceService")
@org.springframework.context.annotation.Primary
@RequiredArgsConstructor
@Slf4j
public class AttendanceServiceImpl implements AttendanceService {

    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final TrainerRepository trainerRepository;
    private final UserRepository userRepository;
    private final BatchRepository batchRepository;
    private final AttendanceMapper attendanceMapper;

    @Override
    public AttendanceResponse markAttendance(AttendanceRequest request) {
        return markAttendance(request, null);
    }

    @Override
    public AttendanceResponse markAttendance(AttendanceRequest request, String trainerEmail) {
        String allowedSession = getAllowedSessionType(trainerEmail, request.getSessionType());
        request.setSessionType(allowedSession);

        LocalDate reqDate = request.getAttendanceDate() != null ? request.getAttendanceDate() : LocalDate.now(IST_ZONE);
        LocalDate today = LocalDate.now(IST_ZONE);
        if (reqDate.isAfter(today)) {
            throw new IllegalArgumentException("Attendance cannot be marked for a future date.");
        }

        Trainer trainer = getAuthenticatedTrainer(trainerEmail);
        String rawStudentId = request.getStudentId();
        if (rawStudentId == null || rawStudentId.isBlank()) {
            throw new IllegalArgumentException("Student ID is required.");
        }
        final String studentId = rawStudentId.trim();

        Student student = studentRepository.findById(studentId)
                .or(() -> studentRepository.findAllByStudentId(studentId).stream().findFirst())
                .or(() -> studentRepository.findAllByEmail(studentId).stream().findFirst())
                .or(() -> studentRepository.findAllByMobile(studentId).stream().findFirst())
                .orElse(null);

        if (student == null) {
            throw new ResourceNotFoundException("Student not found with id: " + studentId);
        }

        String studentName = ((student.getFirstName() != null ? student.getFirstName() : "") + " " +
                              (student.getLastName() != null ? student.getLastName() : "")).trim();
        if (studentName.isEmpty()) {
            studentName = student.getEmail() != null ? student.getEmail() : "Student";
        }

        Batch resolvedBatch = resolveAuthenticatedTrainerBatch(trainerEmail, request.getBatchId());
        String effectiveBatchId = resolvedBatch != null ? resolvedBatch.getId()
                : (student.getBatchId() != null ? student.getBatchId() : "BATCH001");

        String trainerIdVal = trainer != null ? trainer.getId() : (request.getTrainerId() != null ? request.getTrainerId() : "TRN001");
        String trainerNameVal = trainer != null ? ((trainer.getFirstName() != null ? trainer.getFirstName() : "") + " " +
                                                  (trainer.getLastName() != null ? trainer.getLastName() : "")).trim()
                                               : "Faculty Trainer";

        // Upsert / Duplicate Check: Check existing Student + Date + SessionType
        Optional<Attendance> existingOpt = attendanceRepository
                .findByStudentIdAndAttendanceDateAndSessionType(student.getId(), reqDate, allowedSession);
        if (existingOpt.isEmpty() && student.getStudentId() != null) {
            existingOpt = attendanceRepository
                    .findByStudentIdAndAttendanceDateAndSessionType(student.getStudentId(), reqDate, allowedSession);
        }

        Attendance attendance;
        if (existingOpt.isPresent()) {
            attendance = existingOpt.get();
            attendance.setStatus(request.getStatus() != null ? request.getStatus().toUpperCase() : "PRESENT");
            attendance.setRemarks(request.getRemarks());
            attendance.setTrainerId(trainerIdVal);
            attendance.setTrainerName(trainerNameVal);
            attendance.setUpdatedAt(LocalDateTime.now(IST_ZONE));
        } else {
            attendance = Attendance.builder()
                    .studentId(studentId)
                    .studentName(studentName)
                    .trainerId(trainerIdVal)
                    .trainerName(trainerNameVal)
                    .batchId(effectiveBatchId)
                    .attendanceDate(reqDate)
                    .sessionType(allowedSession)
                    .status(request.getStatus() != null ? request.getStatus().toUpperCase() : "PRESENT")
                    .remarks(request.getRemarks())
                    .createdAt(LocalDateTime.now(IST_ZONE))
                    .updatedAt(LocalDateTime.now(IST_ZONE))
                    .build();
        }

        Attendance saved = attendanceRepository.save(attendance);
        return attendanceMapper.toResponse(saved);
    }

    @Override
    public AttendanceResponse updateAttendance(String id, AttendanceRequest request) {
        return updateAttendance(id, request, null);
    }

    @Override
    public AttendanceResponse updateAttendance(String id, AttendanceRequest request, String trainerEmail) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with id: " + id));

        String allowedSession = getAllowedSessionType(trainerEmail, request.getSessionType());

        if (attendance.getSessionType() != null && !attendance.getSessionType().equalsIgnoreCase(allowedSession)) {
            if ("TECHNICAL".equalsIgnoreCase(allowedSession)) {
                throw new AccessDeniedException("You are authorized for technical attendance only and cannot manage soft-skill attendance.");
            } else {
                throw new AccessDeniedException("You are authorized for soft-skill attendance only and cannot manage technical attendance.");
            }
        }

        Trainer trainer = getAuthenticatedTrainer(trainerEmail);
        if (request.getStatus() != null) {
            attendance.setStatus(request.getStatus().toUpperCase());
        }
        if (request.getRemarks() != null) {
            attendance.setRemarks(request.getRemarks());
        }
        if (trainer != null) {
            attendance.setTrainerId(trainer.getId());
            attendance.setTrainerName(((trainer.getFirstName() != null ? trainer.getFirstName() : "") + " " +
                                       (trainer.getLastName() != null ? trainer.getLastName() : "")).trim());
        }
        attendance.setUpdatedAt(LocalDateTime.now(IST_ZONE));

        Attendance updated = attendanceRepository.save(attendance);
        return attendanceMapper.toResponse(updated);
    }

    @Override
    public List<AttendanceResponse> getAttendanceByStudent(String studentId) {
        if (studentId == null || studentId.isBlank()) {
            return Collections.emptyList();
        }
        return attendanceRepository.findByStudentId(studentId)
                .stream()
                .map(attendanceMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public com.example.SPT.dto.response.StudentPersonalAttendanceResponse getPersonalAttendance(String userEmailOrStudentId) {
        if (userEmailOrStudentId == null || userEmailOrStudentId.isBlank()) {
            throw new IllegalArgumentException("Student identifier or authenticated email is required");
        }

        final String cleanId = userEmailOrStudentId.trim();

        // 1. Resolve student entity
        Student student = studentRepository.findById(cleanId)
                .or(() -> studentRepository.findByEmail(cleanId))
                .or(() -> studentRepository.findByEmail(cleanId.toLowerCase()))
                .or(() -> studentRepository.findByStudentId(cleanId))
                .or(() -> studentRepository.findAllByStudentId(cleanId).stream().findFirst())
                .or(() -> studentRepository.findAllByEmail(cleanId).stream().findFirst())
                .orElse(null);

        if (student == null) {
            User user = userRepository.findByEmail(cleanId)
                    .or(() -> userRepository.findById(cleanId))
                    .orElse(null);
            if (user != null) {
                student = studentRepository.findByEmail(user.getEmail())
                        .or(() -> studentRepository.findAllByEmail(user.getEmail()).stream().findFirst())
                        .orElse(null);

                if (student == null) {
                    return com.example.SPT.dto.response.StudentPersonalAttendanceResponse.builder()
                            .studentId(user.getId())
                            .studentName(user.getFullName() != null ? user.getFullName() : "Student")
                            .studentEmail(user.getEmail())
                            .batchId(null)
                            .batchName("No batch assigned")
                            .overallAttendance(0.0)
                            .overallAttendancePercentage(0.0)
                            .daysPresent(0)
                            .daysLate(0)
                            .daysAbsent(0)
                            .daysLeave(0)
                            .totalEntries(0)
                            .totalAttendanceDays(0)
                            .records(Collections.emptyList())
                            .build();
                }
            }
        }

        if (student == null) {
            throw new ResourceNotFoundException("Student not found for identifier: " + cleanId);
        }

        String studentName = ((student.getFirstName() != null ? student.getFirstName() : "") + " " +
                              (student.getLastName() != null ? student.getLastName() : "")).trim();
        if (studentName.isEmpty()) {
            studentName = student.getEmail() != null ? student.getEmail() : "Student";
        }

        // 2. Query all personal attendance records for this student
        Set<String> queryIds = new LinkedHashSet<>();
        if (student.getId() != null) queryIds.add(student.getId());
        if (student.getStudentId() != null && !student.getStudentId().isBlank()) queryIds.add(student.getStudentId());
        if (student.getEmail() != null && !student.getEmail().isBlank()) queryIds.add(student.getEmail());

        List<Attendance> allStudentRecords = new ArrayList<>();
        for (String qId : queryIds) {
            List<Attendance> list = attendanceRepository.findByStudentId(qId);
            if (list != null) {
                for (Attendance a : list) {
                    if (a != null && a.getId() != null && allStudentRecords.stream().noneMatch(x -> a.getId().equals(x.getId()))) {
                        allStudentRecords.add(a);
                    }
                }
            }
        }

        // Sort descending by date
        allStudentRecords.sort((a, b) -> {
            if (a.getAttendanceDate() == null && b.getAttendanceDate() == null) return 0;
            if (a.getAttendanceDate() == null) return 1;
            if (b.getAttendanceDate() == null) return -1;
            return b.getAttendanceDate().compareTo(a.getAttendanceDate());
        });

        // 3. Compute stats
        long totalEntries = allStudentRecords.size();
        long daysPresent = allStudentRecords.stream().filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus())).count();
        long daysLate = allStudentRecords.stream().filter(r -> "LATE".equalsIgnoreCase(r.getStatus())).count();
        long daysAbsent = allStudentRecords.stream().filter(r -> "ABSENT".equalsIgnoreCase(r.getStatus())).count();
        long daysLeave = allStudentRecords.stream().filter(r -> "LEAVE".equalsIgnoreCase(r.getStatus())).count();

        double overallAttendance = totalEntries > 0
                ? Math.round(((daysPresent + daysLate) * 100.0 / totalEntries) * 10.0) / 10.0
                : 0.0;

        // Resolve Batch name
        String batchName = student.getBatchName();
        if ((batchName == null || batchName.isBlank()) && student.getBatchId() != null && !student.getBatchId().isBlank()) {
            Batch b = batchRepository.findById(student.getBatchId()).orElse(null);
            if (b != null && b.getBatchName() != null) {
                batchName = b.getBatchName();
            }
        }

        List<AttendanceResponse> responseList = allStudentRecords.stream()
                .map(attendanceMapper::toResponse)
                .collect(Collectors.toList());

        return com.example.SPT.dto.response.StudentPersonalAttendanceResponse.builder()
                .studentId(student.getStudentId() != null ? student.getStudentId() : student.getId())
                .studentName(studentName)
                .studentEmail(student.getEmail())
                .batchId(student.getBatchId())
                .batchName(batchName != null ? batchName : "No batch assigned")
                .overallAttendance(overallAttendance)
                .overallAttendancePercentage(overallAttendance)
                .daysPresent(daysPresent)
                .daysLate(daysLate)
                .daysAbsent(daysAbsent)
                .daysLeave(daysLeave)
                .totalEntries(totalEntries)
                .totalAttendanceDays(totalEntries)
                .records(responseList)
                .build();
    }

    @Override
    public List<AttendanceResponse> getAttendanceByBatch(String batchId) {
        if (batchId == null || batchId.isBlank()) {
            return Collections.emptyList();
        }
        final String rawBatchId = batchId.trim();
        Optional<Batch> batchOpt = batchRepository.findById(rawBatchId)
                .or(() -> batchRepository.findByBatchName(rawBatchId));
        String targetBatchId = batchOpt.isPresent() ? batchOpt.get().getId() : rawBatchId;

        List<Attendance> records = attendanceRepository.findByBatchId(targetBatchId);
        if (records.isEmpty() && !targetBatchId.equals(rawBatchId)) {
            records = attendanceRepository.findByBatchId(rawBatchId);
        }
        return records.stream()
                .map(attendanceMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TodayAttendanceResponse getTodayAttendance(String batchId, LocalDate date, String sessionType, String trainerEmail) {
        log.info("--- GET TODAY ATTENDANCE --- Email: '{}', Requested Batch: '{}', Requested Session: '{}'", trainerEmail, batchId, sessionType);

        String allowedSession = getAllowedSessionType(trainerEmail, sessionType);
        log.info("Authorized Session Type resolved: {}", allowedSession);

        Batch resolvedBatch = resolveAuthenticatedTrainerBatch(trainerEmail, batchId);
        String effectiveBatchId = resolvedBatch != null ? resolvedBatch.getId()
                : ((batchId != null && !batchId.trim().isEmpty()) ? batchId : "BATCH001");
        String batchName = resolvedBatch != null ? resolvedBatch.getBatchName() : "Assigned Trainer Batch";

        LocalDate targetDate = (date != null) ? date : LocalDate.now(IST_ZONE);

        List<Student> students = getStudentsForBatch(resolvedBatch, effectiveBatchId);
        log.info("Total active students retrieved for batch: {}", students.size());

        List<Attendance> dateAttendances = Collections.emptyList();
        if (effectiveBatchId != null && !effectiveBatchId.isBlank()) {
            dateAttendances = attendanceRepository.findByBatchIdAndAttendanceDateAndSessionType(effectiveBatchId, targetDate, allowedSession);
        }

        Map<String, Attendance> attMap = new HashMap<>();
        for (Attendance att : dateAttendances) {
            if (att.getStudentId() != null) {
                attMap.put(att.getStudentId(), att);
            }
        }

        List<StudentAttendanceDetailResponse> studentDetails = new ArrayList<>();
        long presentCount = 0;
        long absentCount = 0;
        long lateCount = 0;
        long leaveCount = 0;
        long notMarkedCount = 0;

        for (Student stu : students) {
            if (stu == null) continue;

            Attendance att = attMap.get(stu.getId());
            if (att == null && stu.getEmail() != null) {
                att = attMap.get(stu.getEmail());
            }

            String todayStatus = "NOT MARKED";
            String todayRemarks = "";
            String attId = null;

            if (att != null) {
                todayStatus = att.getStatus() != null ? att.getStatus().toUpperCase() : "NOT MARKED";
                todayRemarks = att.getRemarks() != null ? att.getRemarks() : "";
                attId = att.getId();
            }

            switch (todayStatus) {
                case "PRESENT" -> presentCount++;
                case "ABSENT" -> absentCount++;
                case "LATE" -> lateCount++;
                case "LEAVE" -> leaveCount++;
                default -> notMarkedCount++;
            }

            // Calculate overall session-specific attendance stats for student across DB
            List<Attendance> stuSessionAtt = Collections.emptyList();
            if (stu.getId() != null) {
                stuSessionAtt = attendanceRepository.findByStudentId(stu.getId())
                        .stream()
                        .filter(a -> a != null && allowedSession.equalsIgnoreCase(a.getSessionType()))
                        .collect(Collectors.toList());
            }

            long totalSessions = stuSessionAtt.size();
            long presentSessions = stuSessionAtt.stream()
                    .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus()) || "LATE".equalsIgnoreCase(a.getStatus()))
                    .count();

            double overallPct = totalSessions > 0 ? (presentSessions * 100.0) / totalSessions : 100.0;
            double roundedOverall = Math.round(overallPct * 10.0) / 10.0;
            boolean lowWarning = totalSessions >= 3 && roundedOverall < 75.0;

            Attendance lastAtt = stuSessionAtt.stream()
                    .filter(a -> a.getAttendanceDate() != null)
                    .max(Comparator.comparing(Attendance::getAttendanceDate))
                    .orElse(null);

            String stuDisplayName = ((stu.getFirstName() != null ? stu.getFirstName() : "") + " " +
                                     (stu.getLastName() != null ? stu.getLastName() : "")).trim();
            if (stuDisplayName.isEmpty()) {
                stuDisplayName = stu.getEmail() != null ? stu.getEmail() : "Student Candidate";
            }

            studentDetails.add(StudentAttendanceDetailResponse.builder()
                    .studentId(stu.getId())
                    .studentName(stuDisplayName)
                    .studentEmail(stu.getEmail())
                    .batchId(effectiveBatchId)
                    .todayStatus(todayStatus)
                    .todayRemarks(todayRemarks)
                    .todayAttendanceId(attId)
                    .lastAttendanceDate(lastAtt != null ? lastAtt.getAttendanceDate() : null)
                    .lastAttendanceStatus(lastAtt != null ? lastAtt.getStatus() : "N/A")
                    .overallAttendancePercentage(roundedOverall)
                    .totalSessions(totalSessions)
                    .presentSessions(presentSessions)
                    .lowAttendanceWarning(lowWarning)
                    .build());
        }

        long totalStudents = students.size();
        // Attendance % = (PRESENT / TOTAL STUDENTS) * 100
        double attPct = totalStudents > 0 ? (presentCount * 100.0) / totalStudents : 0.0;
        long markedCount = presentCount + absentCount + lateCount + leaveCount;
        double completionPct = totalStudents > 0 ? (markedCount * 100.0) / totalStudents : 0.0;

        return TodayAttendanceResponse.builder()
                .batchId(effectiveBatchId)
                .batchName(batchName)
                .sessionType(allowedSession)
                .attendanceDate(targetDate)
                .totalStudents(totalStudents)
                .presentCount(presentCount)
                .absentCount(absentCount)
                .lateCount(lateCount)
                .leaveCount(leaveCount)
                .notMarkedCount(notMarkedCount)
                .attendancePercentage(Math.round(attPct * 10.0) / 10.0)
                .completionPercentage(Math.round(completionPct * 10.0) / 10.0)
                .students(studentDetails)
                .build();
    }

    @Override
    public TodayAttendanceResponse bulkMarkAttendance(BulkAttendanceRequest request, String trainerEmail) {
        String allowedSession = getAllowedSessionType(trainerEmail, request.getSessionType());
        request.setSessionType(allowedSession);

        Trainer trainer = getAuthenticatedTrainer(trainerEmail);
        LocalDate reqDate = request.getAttendanceDate() != null ? request.getAttendanceDate() : LocalDate.now(IST_ZONE);
        if (reqDate.isAfter(LocalDate.now(IST_ZONE))) {
            throw new IllegalArgumentException("Attendance cannot be marked for a future date.");
        }

        Batch resolvedBatch = resolveAuthenticatedTrainerBatch(trainerEmail, request.getBatchId());
        String batchId = resolvedBatch != null ? resolvedBatch.getId()
                : ((request.getBatchId() != null && !request.getBatchId().trim().isEmpty())
                ? request.getBatchId()
                : "BATCH001");

        List<Student> students = getStudentsForBatch(resolvedBatch, batchId);
        List<Attendance> existingRecords = attendanceRepository.findByBatchIdAndAttendanceDateAndSessionType(batchId, reqDate, allowedSession);

        Set<String> alreadyMarkedStudentIds = existingRecords.stream()
                .map(Attendance::getStudentId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        String trainerIdVal = trainer != null ? trainer.getId() : "TRN001";
        String trainerNameVal = trainer != null ? ((trainer.getFirstName() != null ? trainer.getFirstName() : "") + " " +
                                                  (trainer.getLastName() != null ? trainer.getLastName() : "")).trim()
                                               : "Faculty Trainer";
        String targetStatus = (request.getTargetStatus() != null) ? request.getTargetStatus().toUpperCase() : "PRESENT";

        List<Attendance> newRecords = new ArrayList<>();
        for (Student stu : students) {
            if (stu != null && stu.getId() != null && !alreadyMarkedStudentIds.contains(stu.getId())) {
                String stuName = ((stu.getFirstName() != null ? stu.getFirstName() : "") + " " +
                                  (stu.getLastName() != null ? stu.getLastName() : "")).trim();
                if (stuName.isEmpty()) {
                    stuName = stu.getEmail() != null ? stu.getEmail() : "Student";
                }

                newRecords.add(Attendance.builder()
                        .studentId(stu.getId())
                        .studentName(stuName)
                        .trainerId(trainerIdVal)
                        .trainerName(trainerNameVal)
                        .batchId(batchId)
                        .attendanceDate(reqDate)
                        .sessionType(allowedSession)
                        .status(targetStatus)
                        .remarks("Bulk marked as " + targetStatus)
                        .createdAt(LocalDateTime.now(IST_ZONE))
                        .updatedAt(LocalDateTime.now(IST_ZONE))
                        .build());
            }
        }

        if (!newRecords.isEmpty()) {
            attendanceRepository.saveAll(newRecords);
        }

        return getTodayAttendance(batchId, reqDate, allowedSession, trainerEmail);
    }

    @Override
    public StudentMonthlyAttendanceResponse getStudentMonthlyAttendance(String studentId, Integer month, Integer year, String trainerEmail) {
        String allowedSession = getAllowedSessionType(trainerEmail, null);
        LocalDate today = LocalDate.now(IST_ZONE);

        int targetMonth = (month != null && month >= 1 && month <= 12) ? month : today.getMonthValue();
        int targetYear = (year != null && year >= 2000) ? year : today.getYear();

        LocalDate startDate = LocalDate.of(targetYear, targetMonth, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        Student student = studentRepository.findById(studentId)
                .orElseGet(() -> studentRepository.findByEmail(studentId)
                        .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId)));

        List<Attendance> monthRecords = attendanceRepository.findByStudentIdAndAttendanceDateBetween(studentId, startDate, endDate);

        Map<LocalDate, List<Attendance>> byDate = monthRecords.stream()
                .filter(a -> a.getAttendanceDate() != null)
                .collect(Collectors.groupingBy(Attendance::getAttendanceDate));

        List<StudentMonthlyAttendanceResponse.DailyAttendanceDetail> dailyList = new ArrayList<>();

        long presentCount = 0;
        long absentCount = 0;
        long lateCount = 0;
        long leaveCount = 0;

        for (LocalDate d = startDate; !d.isAfter(endDate) && !d.isAfter(today); d = d.plusDays(1)) {
            List<Attendance> dayAtts = byDate.getOrDefault(d, Collections.emptyList());

            String techStatus = "NOT MARKED";
            String softStatus = "NOT MARKED";
            String remarks = "";

            for (Attendance a : dayAtts) {
                if (a == null) continue;
                if ("SOFT_SKILL".equalsIgnoreCase(a.getSessionType()) || "SOFTSKILL".equalsIgnoreCase(a.getSessionType())) {
                    softStatus = a.getStatus() != null ? a.getStatus() : "NOT MARKED";
                } else {
                    techStatus = a.getStatus() != null ? a.getStatus() : "NOT MARKED";
                }
                if (a.getRemarks() != null && !a.getRemarks().isBlank()) {
                    remarks = a.getRemarks();
                }
            }

            boolean isSoftSkill = "SOFT_SKILL".equalsIgnoreCase(allowedSession) || "SOFTSKILL".equalsIgnoreCase(allowedSession);
            String currentSessionStatus = isSoftSkill ? softStatus : techStatus;

            if ("PRESENT".equalsIgnoreCase(currentSessionStatus)) presentCount++;
            else if ("ABSENT".equalsIgnoreCase(currentSessionStatus)) absentCount++;
            else if ("LATE".equalsIgnoreCase(currentSessionStatus)) lateCount++;
            else if ("LEAVE".equalsIgnoreCase(currentSessionStatus)) leaveCount++;

            dailyList.add(StudentMonthlyAttendanceResponse.DailyAttendanceDetail.builder()
                    .date(d)
                    .technicalStatus(techStatus)
                    .softSkillStatus(softStatus)
                    .overallStatus(currentSessionStatus)
                    .remarks(remarks)
                    .build());
        }

        long totalSessions = dailyList.size();
        double pct = totalSessions > 0 ? (presentCount * 100.0) / totalSessions : 100.0;
        double roundedPct = Math.round(pct * 10.0) / 10.0;

        String studentName = ((student.getFirstName() != null ? student.getFirstName() : "") + " " +
                              (student.getLastName() != null ? student.getLastName() : "")).trim();
        if (studentName.isEmpty()) {
            studentName = student.getEmail() != null ? student.getEmail() : "Student";
        }

        return StudentMonthlyAttendanceResponse.builder()
                .studentId(student.getId())
                .studentName(studentName)
                .studentEmail(student.getEmail())
                .batchId(student.getBatchId())
                .month(targetMonth)
                .year(targetYear)
                .totalSessions(totalSessions)
                .presentCount(presentCount)
                .absentCount(absentCount)
                .lateCount(lateCount)
                .leaveCount(leaveCount)
                .attendancePercentage(roundedPct)
                .lowAttendanceWarning(totalSessions >= 3 && roundedPct < 75.0)
                .dailyRecords(dailyList)
                .build();
    }

    @Override
    public TodayAttendanceResponse getAttendanceHistory(String batchId, LocalDate date, String sessionType, String trainerEmail) {
        String allowedSession = getAllowedSessionType(trainerEmail, sessionType);
        LocalDate targetDate = (date != null) ? date : LocalDate.now(IST_ZONE);
        return getTodayAttendance(batchId, targetDate, allowedSession, trainerEmail);
    }

    // Helper: Resolve Authenticated Trainer's Assigned Batch with Strict Security Check
    private Batch resolveAuthenticatedTrainerBatch(String trainerEmail, String requestedBatchId) {
        log.info("Resolving batch for trainer email: '{}', requested batchId: '{}'", trainerEmail, requestedBatchId);

        User authenticatedUser = (trainerEmail != null && !trainerEmail.isBlank())
                ? userRepository.findByEmail(trainerEmail).orElse(null)
                : null;

        Trainer authenticatedTrainer = (trainerEmail != null && !trainerEmail.isBlank())
                ? trainerRepository.findByEmail(trainerEmail).orElse(null)
                : null;

        boolean isAdmin = authenticatedUser != null && authenticatedUser.getRole() == Role.ADMIN;

        // 1. If Admin, allow any requested batch directly
        if (isAdmin && requestedBatchId != null && !requestedBatchId.isBlank()) {
            Optional<Batch> reqBatchOpt = batchRepository.findById(requestedBatchId);
            if (reqBatchOpt.isPresent()) return reqBatchOpt.get();
        }

        // 2. Find trainer's assigned batch
        Batch assignedBatch = null;
        if (authenticatedUser != null) {
            List<Batch> techBatches = batchRepository.findByTechnicalTrainer_Id(authenticatedUser.getId());
            if (techBatches != null && !techBatches.isEmpty()) {
                assignedBatch = techBatches.get(0);
            }

            if (assignedBatch == null) {
                List<Batch> softBatches = batchRepository.findBySoftSkillsTrainer_Id(authenticatedUser.getId());
                if (!softBatches.isEmpty()) {
                    assignedBatch = softBatches.get(0);
                }
            }
        }

        if (assignedBatch == null && authenticatedTrainer != null && authenticatedTrainer.getBatchId() != null && !authenticatedTrainer.getBatchId().isBlank()) {
            assignedBatch = batchRepository.findById(authenticatedTrainer.getBatchId()).orElse(null);
        }

        // 3. Security Verification: If requestedBatchId is sent, verify it belongs to this trainer
        if (requestedBatchId != null && !requestedBatchId.isBlank()) {
            if (!isAdmin && assignedBatch != null) {
                boolean matchesId = requestedBatchId.equalsIgnoreCase(assignedBatch.getId());
                boolean matchesName = assignedBatch.getBatchName() != null && requestedBatchId.equalsIgnoreCase(assignedBatch.getBatchName());
                if (!matchesId && !matchesName) {
                    log.warn("Unauthorized batch access attempt by '{}' for batch '{}'", trainerEmail, requestedBatchId);
                    throw new AccessDeniedException("You are not authorized to access batch: " + requestedBatchId);
                }
            } else if (assignedBatch == null) {
                Optional<Batch> reqBatchOpt = batchRepository.findById(requestedBatchId);
                if (reqBatchOpt.isPresent()) return reqBatchOpt.get();
            }
        }

        if (assignedBatch != null) {
            return assignedBatch;
        }

        // Fallback: If no batch assigned and no request, check DB batches
        List<Batch> allBatches = batchRepository.findAll();
        if (!allBatches.isEmpty()) {
            return allBatches.get(0);
        }

        return null;
    }

    // Helper: Retrieve Active Students for Batch
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

        // Deduplicate students by ID
        Map<String, Student> uniqueStudents = new LinkedHashMap<>();
        for (Student s : students) {
            if (s != null && s.getId() != null) {
                uniqueStudents.putIfAbsent(s.getId(), s);
            }
        }

        // Filter active students (active flag null or true)
        return uniqueStudents.values().stream()
                .filter(s -> s.getActive() == null || Boolean.TRUE.equals(s.getActive()))
                .collect(Collectors.toList());
    }

    // Helper: Determine Allowed Session Type for Authenticated Trainer with Strict Security
    private String getAllowedSessionType(String trainerEmail, String requestedSessionType) {
        if (trainerEmail == null || trainerEmail.trim().isEmpty()) {
            return normalizeSessionType(requestedSessionType);
        }

        Optional<User> userOpt = userRepository.findByEmail(trainerEmail);
        if (userOpt.isPresent()) {
            User u = userOpt.get();
            if (u.getRole() == Role.ADMIN) {
                return normalizeSessionType(requestedSessionType);
            }

            if (u.getTrainerType() == TrainerType.SOFT_SKILLS) {
                if (requestedSessionType != null && isTechnicalSession(requestedSessionType)) {
                    throw new AccessDeniedException("You are authorized only for soft-skill sessions and cannot access or manage technical attendance.");
                }
                return "SOFT_SKILL";
            } else if (u.getTrainerType() == TrainerType.TECHNICAL) {
                if (requestedSessionType != null && isSoftSkillSession(requestedSessionType)) {
                    throw new AccessDeniedException("You are authorized only for technical sessions and cannot access or manage soft-skill attendance.");
                }
                return "TECHNICAL";
            }
        }

        Optional<Trainer> trainerOpt = trainerRepository.findByEmail(trainerEmail);
        if (trainerOpt.isPresent()) {
            Trainer t = trainerOpt.get();
            String spec = t.getSpecialization() != null ? t.getSpecialization().toUpperCase() : "";
            if (spec.contains("SOFT") || spec.contains("COMMUNICATION") || spec.contains("BEHAVIORAL")) {
                if (requestedSessionType != null && isTechnicalSession(requestedSessionType)) {
                    throw new AccessDeniedException("You are authorized only for soft-skill sessions and cannot access or manage technical attendance.");
                }
                return "SOFT_SKILL";
            } else if (spec.contains("JAVA") || spec.contains("SPRING") || spec.contains("REACT") || spec.contains("TECH") || spec.contains("PYTHON")) {
                if (requestedSessionType != null && isSoftSkillSession(requestedSessionType)) {
                    throw new AccessDeniedException("You are authorized only for technical sessions and cannot access or manage soft-skill attendance.");
                }
                return "TECHNICAL";
            }
        }

        return normalizeSessionType(requestedSessionType);
    }

    private boolean isTechnicalSession(String sessionType) {
        if (sessionType == null) return false;
        String s = sessionType.trim().toUpperCase();
        return s.contains("TECH");
    }

    private boolean isSoftSkillSession(String sessionType) {
        if (sessionType == null) return false;
        String s = sessionType.trim().toUpperCase();
        return s.contains("SOFT") || s.contains("COMMUNICATION");
    }

    private String normalizeSessionType(String sessionType) {
        if (sessionType == null || sessionType.trim().isEmpty()) {
            return "TECHNICAL";
        }
        return isSoftSkillSession(sessionType) ? "SOFT_SKILL" : "TECHNICAL";
    }

    private Trainer getAuthenticatedTrainer(String trainerEmail) {
        if (trainerEmail == null || trainerEmail.trim().isEmpty()) {
            return null;
        }
        return trainerRepository.findByEmail(trainerEmail).orElse(null);
    }
}