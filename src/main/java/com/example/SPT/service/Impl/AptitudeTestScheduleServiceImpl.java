package com.example.SPT.service.Impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.SPT.dto.request.AptitudeTestScheduleRequest;
import com.example.SPT.dto.response.AptitudeTestScheduleResponse;
import com.example.SPT.entity.AptitudeTestSchedule;
import com.example.SPT.exception.ResourceNotFoundException;
import com.example.SPT.repository.AptitudeTestScheduleRepository;
import com.example.SPT.service.AptitudeTestScheduleService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AptitudeTestScheduleServiceImpl
        implements AptitudeTestScheduleService {

    private final AptitudeTestScheduleRepository scheduleRepository;

    @Override
    public AptitudeTestScheduleResponse createSchedule(
            AptitudeTestScheduleRequest request) {

        validateTime(request);

        AptitudeTestSchedule schedule = AptitudeTestSchedule.builder()
                .testName(request.getTestName())
                .testDate(request.getTestDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .trainingCenter(request.getTrainingCenter())
                .address(request.getAddress())
                .instructions(request.getInstructions())
                .status("SCHEDULED")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        AptitudeTestSchedule savedSchedule =
                scheduleRepository.save(schedule);

        return mapToResponse(savedSchedule);
    }

    @Override
    public AptitudeTestScheduleResponse getScheduleById(String id) {

        AptitudeTestSchedule schedule = getSchedule(id);

        return mapToResponse(schedule);
    }

    @Override
    public List<AptitudeTestScheduleResponse> getAllSchedules() {

        return scheduleRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public AptitudeTestScheduleResponse updateSchedule(
            String id,
            AptitudeTestScheduleRequest request) {

        validateTime(request);

        AptitudeTestSchedule schedule = getSchedule(id);

        if ("CANCELLED".equals(schedule.getStatus())) {
            throw new IllegalStateException(
                    "Cancelled aptitude test cannot be updated");
        }

        if ("COMPLETED".equals(schedule.getStatus())) {
            throw new IllegalStateException(
                    "Completed aptitude test cannot be updated");
        }

        schedule.setTestName(request.getTestName());
        schedule.setTestDate(request.getTestDate());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setTrainingCenter(request.getTrainingCenter());
        schedule.setAddress(request.getAddress());
        schedule.setInstructions(request.getInstructions());

        schedule.setUpdatedAt(LocalDateTime.now());

        AptitudeTestSchedule updatedSchedule =
                scheduleRepository.save(schedule);

        return mapToResponse(updatedSchedule);
    }

    @Override
    public AptitudeTestScheduleResponse cancelSchedule(String id) {

        AptitudeTestSchedule schedule = getSchedule(id);

        if ("COMPLETED".equals(schedule.getStatus())) {
            throw new IllegalStateException(
                    "Completed aptitude test cannot be cancelled");
        }

        if ("CANCELLED".equals(schedule.getStatus())) {
            throw new IllegalStateException(
                    "Aptitude test is already cancelled");
        }

        schedule.setStatus("CANCELLED");
        schedule.setUpdatedAt(LocalDateTime.now());

        AptitudeTestSchedule cancelledSchedule =
                scheduleRepository.save(schedule);

        return mapToResponse(cancelledSchedule);
    }

    @Override
    public AptitudeTestScheduleResponse getNextScheduledTest() {

        AptitudeTestSchedule schedule =
                scheduleRepository
                        .findFirstByStatusOrderByTestDateAscStartTimeAsc(
                                "SCHEDULED")
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No scheduled aptitude test found"));

        return mapToResponse(schedule);
    }

    private AptitudeTestSchedule getSchedule(String id) {

        return scheduleRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Aptitude test schedule not found with id : "
                                        + id));
    }

    private void validateTime(
            AptitudeTestScheduleRequest request) {

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException(
                    "End time must be after start time");
        }
    }

    private AptitudeTestScheduleResponse mapToResponse(
            AptitudeTestSchedule schedule) {

        return AptitudeTestScheduleResponse.builder()
                .id(schedule.getId())
                .testName(schedule.getTestName())
                .testDate(schedule.getTestDate())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .trainingCenter(schedule.getTrainingCenter())
                .address(schedule.getAddress())
                .instructions(schedule.getInstructions())
                .status(schedule.getStatus())
                .createdAt(schedule.getCreatedAt())
                .updatedAt(schedule.getUpdatedAt())
                .build();
    }
}