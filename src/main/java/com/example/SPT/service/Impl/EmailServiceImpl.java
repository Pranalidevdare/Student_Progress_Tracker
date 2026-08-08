
package com.example.SPT.service.Impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.example.SPT.service.EmailService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String adminEmail;

    @Override
    public void sendAptitudeEligibilityEmail(
            String studentName,
            String studentEmail,
            String aptitudeDate,
            String aptitudeTime) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(adminEmail);
        message.setTo(studentEmail);

        message.setSubject(
                "Student Progress Tracker - Aptitude Test Eligibility");

        message.setText(
                "Dear " + studentName + ",\n\n"
                + "Congratulations!\n\n"
                + "Your application has been reviewed successfully "
                + "and you are eligible to proceed to the aptitude test.\n\n"
                + "Your aptitude test has been scheduled as follows:\n\n"
                + "Date: " + aptitudeDate + "\n"
                + "Time: " + aptitudeTime + "\n\n"
                + "Please be available at the scheduled time.\n\n"
                + "Further instructions regarding the aptitude test "
                + "will be communicated to you.\n\n"
                + "Regards,\n"
                + "Admin\n"
                + "Student Progress Tracker"
        );

        mailSender.send(message);
    }
}