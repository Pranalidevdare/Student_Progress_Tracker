package com.example.SPT.service;

import java.util.List;

import com.example.SPT.dto.request.AptitudeTestScheduleRequest;
import com.example.SPT.dto.response.AptitudeTestScheduleResponse;

public interface AptitudeTestScheduleService {

    // Admin creates the common aptitude test schedule
    AptitudeTestScheduleResponse createSchedule(
            AptitudeTestScheduleRequest request);

    // Get a schedule by ID
    AptitudeTestScheduleResponse getScheduleById(String id);

    // Get all schedules
    List<AptitudeTestScheduleResponse> getAllSchedules();

    // Update an existing schedule
    AptitudeTestScheduleResponse updateSchedule(
            String id,
            AptitudeTestScheduleRequest request);

    // Cancel a scheduled test
    AptitudeTestScheduleResponse cancelSchedule(String id);

    // Get the next scheduled aptitude test
    AptitudeTestScheduleResponse getNextScheduledTest();
}
