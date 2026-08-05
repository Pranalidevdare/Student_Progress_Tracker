package com.finalproject.studentprogresstracker.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.finalproject.studentprogresstracker.entity.GuestSession;
import com.finalproject.studentprogresstracker.repository.GuestSessionRepository;

@Service
public class GuestSessionService {

    @Autowired
    private GuestSessionRepository guestSessionRepository;

    // Add Guest Session
    public GuestSession addGuestSession(GuestSession guestSession) {

        guestSession.setSessionDate(LocalDate.now());

        return guestSessionRepository.save(guestSession);
    }

    // Get All Guest Sessions
    public List<GuestSession> getAllGuestSessions() {

        return guestSessionRepository.findAll();
    }

    // Get Guest Session By Id
    public GuestSession getGuestSessionById(String sessionId) {

        return guestSessionRepository.findById(sessionId)
                .orElseThrow(() ->
                        new RuntimeException("Guest Session Not Found"));
    }

    // Get Guest Sessions By Trainer
    public List<GuestSession> getGuestSessionByTrainer(String trainerId) {

        return guestSessionRepository.findByTrainerId(trainerId);
    }

    // Get Guest Sessions By Date
    public List<GuestSession> getGuestSessionByDate(LocalDate sessionDate) {

        return guestSessionRepository.findBySessionDate(sessionDate);
    }

    // Update Guest Session
    public GuestSession updateGuestSession(String sessionId,
                                           GuestSession guestSession) {

        GuestSession existingSession =
                guestSessionRepository.findById(sessionId)
                        .orElseThrow(() ->
                                new RuntimeException("Guest Session Not Found"));

        existingSession.setTrainerId(guestSession.getTrainerId());
        existingSession.setSpeakerName(guestSession.getSpeakerName());
        existingSession.setTopic(guestSession.getTopic());
        existingSession.setSessionDate(guestSession.getSessionDate());
        existingSession.setVenue(guestSession.getVenue());
        existingSession.setDescription(guestSession.getDescription());

        return guestSessionRepository.save(existingSession);
    }

    // Delete Guest Session
    public String deleteGuestSession(String sessionId) {

        GuestSession session =
                guestSessionRepository.findById(sessionId)
                        .orElseThrow(() ->
                                new RuntimeException("Guest Session Not Found"));

        guestSessionRepository.delete(session);

        return "Guest Session Deleted Successfully";
    }

}