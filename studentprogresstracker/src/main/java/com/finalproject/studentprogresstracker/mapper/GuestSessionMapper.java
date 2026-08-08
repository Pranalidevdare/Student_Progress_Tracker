package com.finalproject.studentprogresstracker.mapper;

import org.springframework.stereotype.Component;

import com.finalproject.studentprogresstracker.dto.response.GuestSessionResponse;
import com.finalproject.studentprogresstracker.entity.GuestSession;

@Component
public class GuestSessionMapper {

    public GuestSessionResponse toResponse(GuestSession guestSession) {

        if (guestSession == null) {
            return null;
        }

        return GuestSessionResponse.builder()
                .id(guestSession.getId())
                .title(guestSession.getTitle())
                .speakerName(guestSession.getSpeakerName())
                .designation(guestSession.getDesignation())
                .organization(guestSession.getOrganization())
                .topic(guestSession.getTopic())
                .description(guestSession.getDescription())
                .batchId(guestSession.getBatchId())
                .sessionDate(guestSession.getSessionDate())
                .sessionTime(guestSession.getSessionTime())
                .venue(guestSession.getVenue())
                .active(guestSession.getActive())
                .createdAt(guestSession.getCreatedAt())
                .updatedAt(guestSession.getUpdatedAt())
                .build();
    }

}