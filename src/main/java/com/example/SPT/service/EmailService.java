package com.example.SPT.service;

import java.time.LocalDateTime;

public interface EmailService {

    void sendAptitudeScheduleEmail(
            String studentEmail,
            String studentName,
            LocalDateTime scheduledAt);
}