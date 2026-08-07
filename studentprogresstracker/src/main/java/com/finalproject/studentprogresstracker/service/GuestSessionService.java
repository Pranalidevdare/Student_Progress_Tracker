package com.finalproject.studentprogresstracker.service;

import java.util.List;

import com.finalproject.studentprogresstracker.dto.request.GuestSessionRequest;
import com.finalproject.studentprogresstracker.dto.response.GuestSessionResponse;

public interface GuestSessionService {

    // Trainer
    GuestSessionResponse createGuestSession(GuestSessionRequest request);

    GuestSessionResponse updateGuestSession(String id, GuestSessionRequest request);

    void deleteGuestSession(String id);

    // Trainer
    List<GuestSessionResponse> getGuestSessionsByTrainer(String trainerId);

    List<GuestSessionResponse> getGuestSessionsByBatch(String batchId);

    // Student
    List<GuestSessionResponse> getAllActiveGuestSessions();

    List<GuestSessionResponse> getActiveGuestSessionsByBatch(String batchId);

    GuestSessionResponse getGuestSessionById(String id);

}