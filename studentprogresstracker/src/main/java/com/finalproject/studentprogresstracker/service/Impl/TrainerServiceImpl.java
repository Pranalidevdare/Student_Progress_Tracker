package com.finalproject.studentprogresstracker.service.Impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.finalproject.studentprogresstracker.dto.request.TrainerRequest;
import com.finalproject.studentprogresstracker.dto.response.GuestSessionResponse;
import com.finalproject.studentprogresstracker.dto.response.NoticeResponse;
import com.finalproject.studentprogresstracker.dto.response.TopperResponse;
import com.finalproject.studentprogresstracker.dto.response.TrainerDashboardResponse;
import com.finalproject.studentprogresstracker.dto.response.TrainerResponse;
import com.finalproject.studentprogresstracker.entity.GuestSession;
import com.finalproject.studentprogresstracker.entity.Notice;
import com.finalproject.studentprogresstracker.entity.Trainer;
import com.finalproject.studentprogresstracker.mapper.GuestSessionMapper;
import com.finalproject.studentprogresstracker.mapper.NoticeMapper;
import com.finalproject.studentprogresstracker.mapper.TrainerMapper;
import com.finalproject.studentprogresstracker.repository.AssessmentResultRepository;
import com.finalproject.studentprogresstracker.repository.AssignmentRepository;
import com.finalproject.studentprogresstracker.repository.AttendanceRepository;
import com.finalproject.studentprogresstracker.repository.GuestSessionRepository;
import com.finalproject.studentprogresstracker.repository.InterviewRepository;
import com.finalproject.studentprogresstracker.repository.NoticeRepository;
import com.finalproject.studentprogresstracker.repository.StudentRepository;
import com.finalproject.studentprogresstracker.repository.StudyMaterialRepository;
import com.finalproject.studentprogresstracker.repository.TrainerRepository;
import com.finalproject.studentprogresstracker.service.TopperService;
import com.finalproject.studentprogresstracker.service.TrainerService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TrainerServiceImpl implements TrainerService {

    private final TrainerRepository trainerRepository;

    private final TopperService topperService;

    private final TrainerMapper trainerMapper;

    private final StudentRepository studentRepository;

    private final NoticeMapper noticeMapper;

    private final AssignmentRepository assignmentRepository;

    private final GuestSessionMapper guestSessionMapper;

    /*
     * Your project uses AssessmentResultRepository
     * as the assessment repository.
     */
    private final AssessmentResultRepository assessmentRepository;

    private final StudyMaterialRepository materialRepository;

    private final InterviewRepository interviewRepository;

    private final AttendanceRepository attendanceRepository;

    private final NoticeRepository noticeRepository;

    private final GuestSessionRepository guestSessionRepository;


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
    public TrainerResponse getTrainerById(
            String id) {

        Trainer trainer =
                getTrainer(id);

        return trainerMapper.toResponse(
                trainer);
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

        Trainer trainer =
                getTrainer(id);

        trainer.setFirstName(
                request.getFirstName());

        trainer.setLastName(
                request.getLastName());

        trainer.setEmail(
                request.getEmail());

        trainer.setMobile(
                request.getMobile());

        trainer.setDateOfBirth(
                request.getDateOfBirth());

        trainer.setGender(
                request.getGender());

        trainer.setEmployeeId(
                request.getEmployeeId());

        trainer.setSpecialization(
                request.getSpecialization());

        trainer.setQualification(
                request.getQualification());

        trainer.setExperience(
                request.getExperience());

        trainer.setBatchId(
                request.getBatchId());

        trainer.setProfileImage(
                request.getProfileImage());

        trainer.setUpdatedAt(
                LocalDateTime.now());

        Trainer updatedTrainer =
                trainerRepository.save(trainer);

        return trainerMapper.toResponse(
                updatedTrainer);
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
    public TrainerDashboardResponse getTrainerDashboard(
            String trainerId) {

        // -----------------------------------------------------
        // 1. Fetch trainer
        // -----------------------------------------------------

        Trainer trainer =
                getTrainer(trainerId);

        TrainerResponse trainerResponse =
                trainerMapper.toResponse(trainer);

        String batchId =
                trainer.getBatchId();


        // -----------------------------------------------------
        // 2. Total students in trainer's batch
        // -----------------------------------------------------

        long totalStudents = 0;

        if (batchId != null
                && !batchId.isBlank()) {

            totalStudents =
                    studentRepository
                            .countByBatchId(batchId);
        }


        // -----------------------------------------------------
        // 3. Total assignments created by trainer
        // -----------------------------------------------------

        long totalAssignments =
                assignmentRepository
                        .countByTrainerId(trainerId);


        // -----------------------------------------------------
        // 4. Total assessment results
        // -----------------------------------------------------

        long totalAssessments =
                assessmentRepository
                        .countByTrainerId(trainerId);


        // -----------------------------------------------------
        // 5. Total study materials
        // -----------------------------------------------------

        long totalStudyMaterials =
                materialRepository
                        .countByTrainerId(trainerId);


        // -----------------------------------------------------
        // 6. Total interviews
        // -----------------------------------------------------

        long totalInterviews =
                interviewRepository
                        .countByTrainerId(trainerId);


        // -----------------------------------------------------
        // 7. Attendance marked today
        // -----------------------------------------------------

        long attendanceMarkedToday =
                attendanceRepository
                        .countByTrainerIdAndAttendanceDate(
                                trainerId,
                                LocalDate.now());


        // -----------------------------------------------------
        // 8. Total guest sessions
        // -----------------------------------------------------

        long totalGuestSessions =
                guestSessionRepository
                        .countByTrainerId(trainerId);


        // -----------------------------------------------------
        // 9. Total notices
        // -----------------------------------------------------

        long totalNotices =
                noticeRepository
                        .countByTrainerId(trainerId);


        // -----------------------------------------------------
        // 10. Latest notices
        // -----------------------------------------------------

        List<NoticeResponse> latestNotices =
                noticeRepository
                        .findByTrainerId(trainerId)
                        .stream()
                        .sorted(
                                Comparator.comparing(
                                        Notice::getCreatedAt,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder())))
                        .limit(5)
                        .map(noticeMapper::toResponse)
                        .toList();


        // -----------------------------------------------------
        // 11. Upcoming guest sessions
        // -----------------------------------------------------

        List<GuestSessionResponse>
                upcomingGuestSessions =
                guestSessionRepository
                        .findByTrainerId(trainerId)
                        .stream()
                        .filter(session ->
                                Boolean.TRUE.equals(
                                        session.getActive()))
                        .filter(session ->
                                session.getSessionDate() != null
                                        && !session.getSessionDate()
                                                .isBefore(
                                                        LocalDate.now()))
                        .sorted(
                                Comparator.comparing(
                                        GuestSession::getSessionDate))
                        .map(
                                guestSessionMapper
                                        ::toResponse)
                        .toList();


        // -----------------------------------------------------
        // 12. Top performers of trainer's batch
        // -----------------------------------------------------

        List<TopperResponse> topPerformers =
                batchId == null
                        || batchId.isBlank()

                        ? List.of()

                        : topperService
                                .getToppersByBatch(batchId)
                                .stream()
                                .limit(5)
                                .toList();


        // -----------------------------------------------------
        // 13. Build dashboard response
        // -----------------------------------------------------

        return TrainerDashboardResponse.builder()

                .trainer(trainerResponse)

                .totalStudents(
                        toInt(totalStudents))

                .totalAssignments(
                        toInt(totalAssignments))

                .totalAssessments(
                        toInt(totalAssessments))

                .totalStudyMaterials(
                        toInt(totalStudyMaterials))

                .totalInterviews(
                        toInt(totalInterviews))

                .attendanceMarkedToday(
                        toInt(attendanceMarkedToday))

                .totalGuestSessions(
                        toInt(totalGuestSessions))

                .totalNotices(
                        toInt(totalNotices))

                .topPerformers(
                        topPerformers)

                .latestNotices(
                        latestNotices)

                .upcomingGuestSessions(
                        upcomingGuestSessions)

                .build();
    }


    // =========================================================
    // PRIVATE: GET TRAINER
    // =========================================================

    private Trainer getTrainer(
            String trainerId) {

        if (trainerId == null
                || trainerId.isBlank()) {

            throw new IllegalArgumentException(
                    "Trainer ID is required");
        }

        return trainerRepository
                .findById(trainerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Trainer not found with id : "
                                        + trainerId));
    }


    // =========================================================
    // PRIVATE: SAFE LONG → INTEGER
    // =========================================================

    private int toInt(long value) {

        if (value > Integer.MAX_VALUE) {
            return Integer.MAX_VALUE;
        }

        return (int) value;
    }
}