package com.finalproject.studentprogresstracker.service.Impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import java.time.LocalDate;

import com.finalproject.studentprogresstracker.dto.response.GuestSessionResponse;
import com.finalproject.studentprogresstracker.dto.response.NoticeResponse;
import com.finalproject.studentprogresstracker.dto.response.TopperResponse;
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
import lombok.RequiredArgsConstructor;
import com.finalproject.studentprogresstracker.dto.request.TrainerRequest;
import com.finalproject.studentprogresstracker.dto.response.TrainerDashboardResponse;
import com.finalproject.studentprogresstracker.dto.response.TrainerResponse;

import com.finalproject.studentprogresstracker.repository.PerformanceRepository;

import com.finalproject.studentprogresstracker.service.TrainerService;

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
    private final AssessmentResultRepository assessmentRepository;
    // OR AssessmentResultRepository if your project uses that

    private final StudyMaterialRepository materialRepository;

    private final InterviewRepository interviewRepository;

    private final AttendanceRepository attendanceRepository;

    private final NoticeRepository noticeRepository;

    private final GuestSessionRepository guestSessionRepository;

    
    @Override
    public TrainerResponse registerTrainer(TrainerRequest request) {

        if (trainerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException(
                    "Trainer already exists with email : " + request.getEmail());
        }

        Trainer trainer = trainerMapper.toEntity(request);

        trainer.setActive(true);
        trainer.setCreatedAt(LocalDateTime.now());
        trainer.setUpdatedAt(LocalDateTime.now());

        Trainer savedTrainer = trainerRepository.save(trainer);

        return trainerMapper.toResponse(savedTrainer);
    }

    @Override
    public TrainerResponse getTrainerById(String id) {

        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Trainer not found with id : " + id));

        return trainerMapper.toResponse(trainer);
    }

    @Override
    public List<TrainerResponse> getAllTrainers() {

        return trainerRepository.findAll()
                .stream()
                .map(trainerMapper::toResponse)
                .collect(Collectors.toList());
    }
    @Override
    public TrainerResponse updateTrainer(String id, TrainerRequest request) {

        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Trainer not found with id : " + id));

        trainer.setFirstName(request.getFirstName());
        trainer.setLastName(request.getLastName());
        trainer.setEmail(request.getEmail());
        trainer.setMobile(request.getMobile());
        trainer.setDateOfBirth(request.getDateOfBirth());
        trainer.setGender(request.getGender());
        trainer.setEmployeeId(request.getEmployeeId());
        trainer.setSpecialization(request.getSpecialization());
        trainer.setQualification(request.getQualification());
        trainer.setExperience(request.getExperience());
        trainer.setBatchId(request.getBatchId());
        trainer.setProfileImage(request.getProfileImage());

        trainer.setUpdatedAt(LocalDateTime.now());

        Trainer updatedTrainer = trainerRepository.save(trainer);

        return trainerMapper.toResponse(updatedTrainer);
    }

    @Override
    public void deleteTrainer(String id) {

        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Trainer not found with id : " + id));

        trainerRepository.delete(trainer);
    }

    @Override
    public TrainerDashboardResponse getTrainerDashboard(String trainerId) {

        Trainer trainer = trainerRepository.findById(trainerId)
                .orElseThrow(() ->
                        new RuntimeException("Trainer not found with id : " + trainerId));

        TrainerResponse trainerResponse = trainerMapper.toResponse(trainer);

     // Total Students
        long totalStudents =
                studentRepository.countByBatchId(trainer.getBatchId());

        // Total Assignments
        long totalAssignments =
                assignmentRepository.countByTrainerId(trainerId);

        // Total Assessment Results
        long totalAssessments =
                assessmentRepository.countByTrainerId(trainerId);

        // Total Study Materials
        long totalStudyMaterials =
                materialRepository.countByTrainerId(trainerId);

        // Total Interviews
        long totalInterviews =
                interviewRepository.countByTrainerId(trainerId);

        // Today's Attendance
        long attendanceToday =
                attendanceRepository.countByTrainerIdAndAttendanceDate(
                        trainerId,
                        LocalDate.now());
        long totalGuestSessions =
                guestSessionRepository.countByTrainerId(trainerId);
        
        long totalNotices =
                noticeRepository.countByTrainerId(trainerId);
        
        List<NoticeResponse> latestNotices =
                noticeRepository.findByTrainerId(trainerId)
                        .stream()
                        .limit(5)
                        .map(noticeMapper::toResponse)
                        .toList();
        
        List<GuestSessionResponse> guestSessions =
                guestSessionRepository.findByTrainerId(trainerId)
                        .stream()
                        .map(guestSessionMapper::toResponse)
                        .toList();
        
        List<TopperResponse> topPerformers =
                topperService.getTopRankers(5);
        
        return TrainerDashboardResponse.builder()

                .trainer(trainerResponse)

                .totalStudents((int) totalStudents)

                .totalAssignments((int) totalAssignments)

                .totalAssessments((int) totalAssessments)

                .totalStudyMaterials((int) totalStudyMaterials)

                .totalInterviews((int) totalInterviews)

                .attendanceMarkedToday((int) attendanceToday)

                .totalGuestSessions((int) totalGuestSessions)

                .totalNotices((int) totalNotices)

                .latestNotices(latestNotices)

                .upcomingGuestSessions(guestSessions)

                .topPerformers(topPerformers)

                .build();
        
        
    }

}