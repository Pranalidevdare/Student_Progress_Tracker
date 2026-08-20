package com.example.SPT.service.Impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.SPT.dto.request.AptitudeScheduleRequest;
import com.example.SPT.dto.response.AptitudeScheduleResponse;
import com.example.SPT.entity.Application;
import com.example.SPT.entity.AptitudeSchedule;
import com.example.SPT.enums.ApplicationStatus;
import com.example.SPT.exception.ResourceNotFoundException;
import com.example.SPT.repository.ApplicationRepository;
import com.example.SPT.repository.AptitudeScheduleRepository;
import com.example.SPT.service.AptitudeScheduleService;
import com.example.SPT.service.EmailService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AptitudeScheduleServiceImpl
        implements AptitudeScheduleService {

    private final AptitudeScheduleRepository
            aptitudeScheduleRepository;
    
    private final ApplicationRepository applicationRepository;
    
    private final EmailService emailService;

    @Override
    public AptitudeScheduleResponse scheduleTest(
            AptitudeScheduleRequest request) {

        // Timezone validation for India (IST)
        java.time.ZoneId istZone = java.time.ZoneId.of("Asia/Kolkata");
        LocalDateTime now = LocalDateTime.now(istZone);
        LocalDateTime scheduledStart = LocalDateTime.of(request.getTestDate(), request.getStartTime());

        if (!scheduledStart.isAfter(now)) {
            throw new IllegalArgumentException(
                    "Aptitude test must be scheduled for a future date and time. (Current time in IST is "
                            + now.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a")) + ")");
        }

        // Validate time
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException(
                    "End time must be after start time");
        }

        // Create aptitude schedule
        AptitudeSchedule schedule = AptitudeSchedule.builder()
                .testId(request.getTestId())
                .testTitle(request.getTestTitle())
                .testDate(request.getTestDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .trainingCenter(request.getTrainingCenter())
                .eligibilityCriteria(
                        request.getEligibilityCriteria())
                .status("SCHEDULED")
                .scheduledByAdminId(
                        request.getScheduledByAdminId())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Save schedule
        AptitudeSchedule savedSchedule =
                aptitudeScheduleRepository.save(schedule);

        // Find all eligible students
        List<Application> eligibleApplications =
                applicationRepository.findByStatus(
                        ApplicationStatus.ELIGIBLE_FOR_APTITUDE);

        // Update their status
        for (Application application : eligibleApplications) {

            application.setStatus(
                    ApplicationStatus.APTITUDE_SCHEDULED);

            application.setUpdatedAt(LocalDateTime.now());

            applicationRepository.save(application);

            final String email = application.getEmail();
            final String name = application.getFullName();
            java.util.concurrent.CompletableFuture.runAsync(() -> {
                try {
                    emailService.sendAptitudeScheduleEmail(
                            email,
                            name,
                            savedSchedule);
                } catch (Exception e) {
                    System.err.println("Aptitude schedule email error: " + e.getMessage());
                }
            });
        }

        return mapToResponse(savedSchedule);
    }

    @Override
    public AptitudeScheduleResponse getScheduleById(
            String id) {

        AptitudeSchedule schedule =
                aptitudeScheduleRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Aptitude schedule not found with id : "
                                                + id));

        return mapToResponse(schedule);
    }

    @Override
    public List<AptitudeScheduleResponse> getAllSchedules() {

        return aptitudeScheduleRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void cancelSchedule(String id) {

        AptitudeSchedule schedule =
                aptitudeScheduleRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Aptitude schedule not found with id : "
                                                + id));

        schedule.setStatus("CANCELLED");
        schedule.setUpdatedAt(LocalDateTime.now());

        aptitudeScheduleRepository.save(schedule);
    }

    private AptitudeScheduleResponse mapToResponse(
            AptitudeSchedule schedule) {

        return AptitudeScheduleResponse.builder()
                .id(schedule.getId())
                .testId(schedule.getTestId())
                .testTitle(schedule.getTestTitle())
                .testDate(schedule.getTestDate())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .trainingCenter(
                        schedule.getTrainingCenter())
                .eligibilityCriteria(
                        schedule.getEligibilityCriteria())
                .status(schedule.getStatus())
                .scheduledByAdminId(
                        schedule.getScheduledByAdminId())
                .createdAt(schedule.getCreatedAt())
                .updatedAt(schedule.getUpdatedAt())
                .build();
    }
}