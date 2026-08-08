package com.finalproject.studentprogresstracker.service.Impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.finalproject.studentprogresstracker.dto.request.GuestSessionRequest;
import com.finalproject.studentprogresstracker.dto.response.GuestSessionResponse;
import com.finalproject.studentprogresstracker.entity.GuestSession;
import com.finalproject.studentprogresstracker.repository.GuestSessionRepository;
import com.finalproject.studentprogresstracker.service.GuestSessionService;

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

        return guestSessionRepository.findByBatchIdAndActiveTrue(batchId)
                .stream()
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