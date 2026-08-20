package com.example.SPT.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AptitudeEligibilityResponse {

    private boolean eligible;

    private boolean alreadyAttempted;

    private boolean scheduled;

    private boolean canStart;

    private String candidateId;

    private String candidateName;

    private String applicationStatus;

    private String message;

    private java.time.LocalDate testDate;

    private java.time.LocalTime startTime;

    private java.time.LocalTime endTime;

    private Long durationMinutes;

    private String scheduledStartDateTime;

    private Long remainingSecondsToStart;

    private Long remainingSecondsForExam;

    private boolean hasInProgressAttempt;

    private AptitudeResultResponse currentAttempt;

    private AptitudeResultResponse previousResult;
}
