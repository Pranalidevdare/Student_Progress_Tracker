package com.example.SPT.service;

import java.util.List;

import com.example.SPT.dto.request.AptitudeScheduleRequest;
import com.example.SPT.dto.response.AptitudeScheduleResponse;

public interface AptitudeScheduleService {

    AptitudeScheduleResponse scheduleTest(
            AptitudeScheduleRequest request);

    AptitudeScheduleResponse getScheduleById(
            String id);

    List<AptitudeScheduleResponse> getAllSchedules();

    void cancelSchedule(String id);
}