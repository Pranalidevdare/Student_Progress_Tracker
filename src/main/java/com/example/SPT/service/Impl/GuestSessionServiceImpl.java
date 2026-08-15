package com.example.SPT.service.Impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.SPT.dto.request.GuestSessionRequest;
import com.example.SPT.dto.response.GuestSessionResponse;
import com.example.SPT.entity.GuestSession;
import com.example.SPT.repository.GuestSessionRepository;
import com.example.SPT.service.GuestSessionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GuestSessionServiceImpl implements GuestSessionService {

    private final GuestSessionRepository guestSessionRepository;

    @Override
    public GuestSessionResponse createGuestSession(GuestSessionRequest request) {

        GuestSession session = GuestSession.builder()
                .title(request.getTitle())
                .speakerName(request.getSpeakerName())
                .companyName(request.getCompanyName())
                .topic(request.getTopic())
                .description(request.getDescription())
                .sessionDate(request.getSessionDate())
                .sessionTime(request.getSessionTime())
                .venue(request.getVenue())
                .batchId(request.getBatchId())
                .trainerId(request.getTrainerId())
                .trainerName(request.getTrainerName())
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return convertToResponse(
                guestSessionRepository.save(session)
        );
    }

    @Override
    public GuestSessionResponse updateGuestSession(String id,
                                                   GuestSessionRequest request) {

        GuestSession session = guestSessionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Guest Session not found"));

        session.setTitle(request.getTitle());
        session.setSpeakerName(request.getSpeakerName());
        session.setCompanyName(request.getCompanyName());
        session.setTopic(request.getTopic());
        session.setDescription(request.getDescription());
        session.setSessionDate(request.getSessionDate());
        session.setSessionTime(request.getSessionTime());
        session.setVenue(request.getVenue());
        session.setBatchId(request.getBatchId());
        session.setTrainerId(request.getTrainerId());
        session.setTrainerName(request.getTrainerName());
        session.setUpdatedAt(LocalDateTime.now());

        return convertToResponse(
                guestSessionRepository.save(session)
        );
    }

    @Override
    public void deleteGuestSession(String id) {

        GuestSession session = guestSessionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Guest Session not found"));

        guestSessionRepository.delete(session);
    }

    @Override
    public List<GuestSessionResponse> getGuestSessionsByTrainer(String trainerId) {

        return guestSessionRepository.findByTrainerId(trainerId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<GuestSessionResponse> getGuestSessionsByBatch(String batchId) {

        return guestSessionRepository.findByBatchId(batchId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<GuestSessionResponse> getAllActiveGuestSessions() {

        return guestSessionRepository.findByActiveTrue()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<GuestSessionResponse> getActiveGuestSessionsByBatch(String batchId) {
        if (batchId == null || batchId.isBlank()) {
            batchId = "BATCH001";
        }
        String cleanBatchId = batchId.trim();

        List<GuestSession> sessions = guestSessionRepository.findByBatchIdAndActiveTrue(cleanBatchId);

        if (sessions.isEmpty()) {
            sessions = guestSessionRepository.findByBatchId(cleanBatchId);
        }

        if (sessions.isEmpty()) {
            List<GuestSession> all = guestSessionRepository.findAll();
            for (GuestSession gs : all) {
                boolean isActive = gs.getActive() == null || Boolean.TRUE.equals(gs.getActive());
                if (isActive && gs.getBatchId() != null && gs.getBatchId().equalsIgnoreCase(cleanBatchId)) {
                    sessions.add(gs);
                }
            }
            if (sessions.isEmpty() && "BATCH001".equalsIgnoreCase(cleanBatchId)) {
                for (GuestSession gs : all) {
                    boolean isActive = gs.getActive() == null || Boolean.TRUE.equals(gs.getActive());
                    if (isActive) {
                        sessions.add(gs);
                    }
                }
            }
        }

        return sessions.stream()
                .filter(gs -> gs.getActive() == null || Boolean.TRUE.equals(gs.getActive()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public GuestSessionResponse getGuestSessionById(String id) {

        GuestSession session = guestSessionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Guest Session not found"));

        return convertToResponse(session);
    }

    private GuestSessionResponse convertToResponse(GuestSession session) {

        return GuestSessionResponse.builder()
                .id(session.getId())
                .title(session.getTitle())
                .speakerName(session.getSpeakerName())
                .companyName(session.getCompanyName())
                .topic(session.getTopic())
                .description(session.getDescription())
                .sessionDate(session.getSessionDate())
                .sessionTime(session.getSessionTime())
                .venue(session.getVenue())
                .batchId(session.getBatchId())
                .trainerId(session.getTrainerId())
                .trainerName(session.getTrainerName())
                .active(session.getActive())
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .build();
    }
}