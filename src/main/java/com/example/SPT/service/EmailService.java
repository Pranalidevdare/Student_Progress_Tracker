package com.example.SPT.service;

import java.time.LocalDate;

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
            String courseName,
            LocalDate startDate,
            String technicalTrainer);

    void sendHomeVisitDecisionEmail(
            String to,
            String studentName,
            boolean passed,
            String comments);

    void sendStudentCredentialsEmail(
            String to,
            String studentName,
            String temporaryPassword,
            String loginUrl);

    void sendStudentCredentialsEmail(
            String to,
            String studentName,
            String studentId,
            String temporaryPassword,
            String loginUrl);

    void sendBatchChangeEmail(
            String to,
            String studentName,
            String oldBatchName,
            String newBatchName,
            LocalDate newBatchStartDate,
            String courseName,
            String technicalTrainer);
}