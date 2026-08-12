package com.example.SPT.service;

import com.example.SPT.entity.AptitudeSchedule;

public interface EmailService {

    void sendRegistrationConfirmationEmail(
            String to,
            String studentName,
            String applicationNumber,
            String programName,
            String registrationDate);

    void sendAptitudeScheduleEmail(
            String to,
            String studentName,
            AptitudeSchedule schedule);

    void sendAptitudeEligibilityEmail(
            String to,
            String studentName);

    void sendOfferLetterEmail(
            String to,
            String studentName,
            String batchName,
            String courseName);
}