package com.example.SPT.service.Impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import java.time.LocalDate;

import com.example.SPT.dto.response.GuestSessionResponse;
import com.example.SPT.dto.response.NoticeResponse;
import com.example.SPT.dto.response.TopperResponse;
import com.example.SPT.entity.Trainer;
import com.example.SPT.mapper.GuestSessionMapper;
import com.example.SPT.mapper.NoticeMapper;
import com.example.SPT.mapper.TrainerMapper;
import com.example.SPT.repository.AssessmentResultRepository;
import com.example.SPT.repository.AssignmentRepository;
import com.example.SPT.repository.AttendanceRepository;
import com.example.SPT.repository.GuestSessionRepository;
import com.example.SPT.repository.InterviewRepository;
import com.example.SPT.repository.NoticeRepository;
import com.example.SPT.repository.StudentRepository;
import com.example.SPT.repository.StudyMaterialRepository;
import com.example.SPT.repository.TrainerRepository;
import com.example.SPT.service.TopperService;
import lombok.RequiredArgsConstructor;
import com.example.SPT.dto.request.TrainerRequest;
import com.example.SPT.dto.response.TrainerDashboardResponse;
import com.example.SPT.dto.response.TrainerResponse;

import com.example.SPT.repository.PerformanceRepository;

import com.example.SPT.service.TrainerService;

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