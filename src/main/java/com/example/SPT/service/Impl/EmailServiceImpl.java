package com.example.SPT.service.Impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.example.SPT.entity.AptitudeSchedule;
import com.example.SPT.service.EmailService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String adminEmail;

    @Override
    public void sendRegistrationConfirmationEmail(
            String to,
            String studentName,
            String applicationNumber,
            String programName,
            String registrationDate) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(adminEmail);
        message.setTo(to);
        message.setSubject("Registration Received - InfoBeans Foundation");

        String pName = (programName != null && !programName.isBlank()) ? programName : "Information Technology Excellence Program (ITEP)";
        String dateStr = (registrationDate != null && !registrationDate.isBlank()) ? registrationDate : java.time.LocalDate.now().toString();

        String text = "🎓 InfoBeans Foundation\n\n"
                + "Dear " + studentName + ",\n\n"
                + "Thank you for registering with InfoBeans Foundation.\n\n"
                + "We have successfully received your application for the " + pName + ". Your application has been submitted successfully and is now under review by our team.\n\n"
                + "📌 Application Status: Received\n"
                + "📅 Registration Date: " + dateStr + "\n"
                + "🆔 Application ID: " + applicationNumber + "\n\n"
                + "As the next step in the selection process, an Aptitude Test will be scheduled soon. The test date, time, and further instructions will be communicated to you through the registered contact details.\n\n"
                + "Please ensure that you regularly check your email and registered contact number for important updates from the InfoBeans Foundation team.\n\n"
                + "Thank you for your interest in InfoBeans Foundation and for taking this step toward building your skills and career.\n\n"
                + "Regards,\n"
                + "InfoBeans Foundation Team\n"
                + "Empowering Students. Building Careers.";

        message.setText(text);
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Registration confirmation email error: " + e.getMessage());
        }
    }

    @Override
    public void sendAptitudeScheduleEmail(
            String to,
            String studentName,
            AptitudeSchedule schedule) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(adminEmail);
        message.setTo(to);

        message.setSubject(
                "Student Progress Tracker - Aptitude Test Eligibility");

        message.setText(
                "Dear " + studentName + ",\n\n"
                + "Congratulations!\n\n"
                + "Your application has been reviewed successfully "
                + "and you are eligible to proceed to the aptitude test.\n\n"
                + "Your aptitude test has been scheduled as follows:\n\n"
                + "Date: " + schedule.getTestDate() + "\n"
                + "Time: " + schedule.getStartTime() + "\n\n"
                + "Please be available at the scheduled time.\n\n"
                + "Further instructions regarding the aptitude test "
                + "will be communicated to you.\n\n"
                + "Regards,\n"
                + "Admin\n"
                + "Student Progress Tracker"
        );

        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Aptitude schedule email error: " + e.getMessage());
        }
    }

    @Override
    public void sendAptitudeEligibilityEmail(String to, String studentName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(adminEmail);
        message.setTo(to);
        message.setSubject("Student Progress Tracker - Selected for Aptitude Test");
        message.setText(
                "Dear " + studentName + ",\n\n"
                + "Congratulations!\n\n"
                + "Your registration application has been processed. Based on the family income criteria (<= 4 Lakhs), "
                + "you are SELECTED FOR THE APTITUDE TEST.\n\n"
                + "Please log in to your portal account to check your scheduled test time and complete your Aptitude Examination.\n\n"
                + "Best of luck!\n\n"
                + "Regards,\n"
                + "Admin Team\n"
                + "Student Progress Tracker"
        );
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Email sending warning: " + e.getMessage());
        }
    }

    @Override
    public void sendOfferLetterEmail(String to, String studentName, String batchName, String courseName, java.time.LocalDate startDate, String technicalTrainer) {
        try {
            jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = 
                    new org.springframework.mail.javamail.MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(adminEmail);
            helper.setTo(to);
            helper.setSubject("Enrollment Letter - InfoBeans Foundation (ITEP)");

            String firstName = studentName != null && studentName.contains(" ") ? 
                    studentName.split(" ")[0] : (studentName != null ? studentName : "Student");
            String currentDate = java.time.LocalDate.now().format(
                    java.time.format.DateTimeFormatter.ofPattern("MMMM dd, yyyy"));
            String batchStartDate = startDate != null ? startDate.format(
                    java.time.format.DateTimeFormatter.ofPattern("MMMM dd, yyyy")) : currentDate;

            String htmlBody = "<html>"
                    + "<body style=\"font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px;\">"
                    + "  <div style=\"display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #d9534f; padding-bottom: 10px; margin-bottom: 25px;\">"
                    + "    <div><h2 style=\"margin: 0; color: #d9534f;\">InfoBeans Foundation</h2></div>"
                    + "    <div style=\"text-align: right; color: #c9302c; font-weight: bold;\">उन्नत राष्ट्र की कल्पना<br><span style=\"color: #333; font-weight: normal; font-size: 14px;\">कम्प्यूटर साक्षरता घर-घर पहुँचाना</span></div>"
                    + "  </div>"
                    + "  <div style=\"text-align: center; font-size: 22px; font-weight: bold; margin: 25px 0;\">Enrollment Letter</div>"
                    + "  <div style=\"margin-bottom: 15px;\">" + currentDate + "</div>"
                    + "  <div style=\"margin-bottom: 20px;\"><strong>" + studentName + "</strong></div>"
                    + "  <div style=\"font-size: 16px; font-weight: 600; margin-bottom: 15px;\">Dear " + firstName + ",</div>"
                    + "  <p><strong>Congratulations!</strong></p>"
                    + "  <p>We are delighted to inform you that you have been selected for the one year Information Technology Excellence Program (ITEP) at InfoBeans Foundation, Pune.</p>"
                    + "  <p>Please refer to the program schedule and other relevant information. We kindly request you to ensure your availability for the commencement of the program.</p>"
                    + "  <div style=\"background-color: #f9f9f9; border-left: 4px solid #d9534f; padding: 15px; margin: 20px 0;\">"
                    + "    <p style=\"margin: 5px 0;\"><strong>Batch :</strong> " + (batchName != null ? batchName : "N/A") + "</p>"
                    + "    <p style=\"margin: 5px 0;\"><strong>Course :</strong> " + (courseName != null ? courseName : "Information Technology Excellence Program (ITEP)") + "</p>"
                    + "    <p style=\"margin: 5px 0;\"><strong>Batch Start Date :</strong> " + batchStartDate + "</p>"
                    + "    <p style=\"margin: 5px 0;\"><strong>Technical Trainer :</strong> " + (technicalTrainer != null ? technicalTrainer : "TBD") + "</p>"
                    + "    <p style=\"margin: 5px 0;\"><strong>Address :</strong> InfoBeans Foundation , Pune / ISBM College of Engineering . 4th Floor . Survey No.44/1/2, Taluka Mulshi, Pashan Sus Road, Nande, Maharashtra 412115</p>"
                    + "    <p style=\"margin: 5px 0;\"><strong>Contact Person :</strong> Omkar Patankar Sir, Mobile: 9981336599</p>"
                    + "  </div>"
                    + "  <div style=\"margin-top: 30px;\">"
                    + "    <p>Best regards,</p>"
                    + "    <p style=\"font-family: cursive; font-size: 18px; margin: 5px 0;\">Dr. Neha Bhopatkar</p>"
                    + "    <p style=\"margin: 0;\"><strong>Dr. Neha Bhopatkar</strong><br>Associate Director HR</p>"
                    + "  </div>"
                    + "</body>"
                    + "</html>";

            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("HTML Enrollment Letter email warning: " + e.getMessage());
        }
    }

    @Override
    public void sendHomeVisitDecisionEmail(String to, String studentName, boolean passed, String comments) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(adminEmail);
        message.setTo(to);
        message.setSubject(passed ? "Home Visit Result: Passed" : "Home Visit Result: Not Selected");
        message.setText("Dear " + studentName + ",\n\n"
                + (passed
                        ? "Congratulations! Your home visit has been approved and you have passed the final selection stage."
                        : "We regret to inform you that your home visit result was not approved. Please review the feedback and continue to follow the program updates.")
                + "\n\n" + (comments != null && !comments.isBlank() ? "Feedback: " + comments + "\n\n" : "")
                + "Regards,\nInfoBeans Foundation Team");
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Home visit decision email warning: " + e.getMessage());
        }
    }

    @Override
    public void sendStudentCredentialsEmail(String to, String studentName, String temporaryPassword, String loginUrl) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(adminEmail);
        message.setTo(to);
        message.setSubject("Your Student Portal Credentials");
        message.setText("Dear " + studentName + ",\n\n"
                + "Your student account has been created successfully.\n\n"
                + "Email: " + to + "\n"
                + "Temporary Password: " + temporaryPassword + "\n\n"
                + "Please sign in at: " + (loginUrl != null && !loginUrl.isBlank() ? loginUrl : "http://localhost:5173/login") + "\n"
                + "You will be required to change your password on first login.\n\n"
                + "Regards,\nInfoBeans Foundation Team");
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Student credentials email warning: " + e.getMessage());
        }
    }

    @Override
    public void sendBatchChangeEmail(String to, String studentName, String oldBatchName, String newBatchName, 
            java.time.LocalDate newBatchStartDate, String courseName, String technicalTrainer) {
        try {
            jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = 
                    new org.springframework.mail.javamail.MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(adminEmail);
            helper.setTo(to);
            helper.setSubject("Your Batch Assignment Has Been Updated");

            String firstName = studentName != null && studentName.contains(" ") ? 
                    studentName.split(" ")[0] : (studentName != null ? studentName : "Student");
            String currentDate = java.time.LocalDate.now().format(
                    java.time.format.DateTimeFormatter.ofPattern("MMMM dd, yyyy"));
            String batchStartDate = newBatchStartDate != null ? newBatchStartDate.format(
                    java.time.format.DateTimeFormatter.ofPattern("MMMM dd, yyyy")) : "TBD";

            String htmlBody = "<html>"
                    + "<body style=\"font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px;\">"
                    + "  <div style=\"display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #d9534f; padding-bottom: 10px; margin-bottom: 25px;\">"
                    + "    <div><h2 style=\"margin: 0; color: #d9534f;\">InfoBeans Foundation</h2></div>"
                    + "    <div style=\"text-align: right; color: #c9302c; font-weight: bold;\">उन्नत राष्ट्र की कल्पना<br><span style=\"color: #333; font-weight: normal; font-size: 14px;\">कम्प्यूटर साक्षरता घर-घर पहुँचाना</span></div>"
                    + "  </div>"
                    + "  <div style=\"text-align: center; font-size: 22px; font-weight: bold; margin: 25px 0; color: #d9534f;\">Batch Assignment Update</div>"
                    + "  <div style=\"margin-bottom: 15px;\">" + currentDate + "</div>"
                    + "  <div style=\"margin-bottom: 20px;\"><strong>" + studentName + "</strong></div>"
                    + "  <div style=\"font-size: 16px; font-weight: 600; margin-bottom: 15px;\">Dear " + firstName + ",</div>"
                    + "  <p>Your batch assignment has been updated by the program administration.</p>"
                    + "  <div style=\"background-color: #f9f9f9; border-left: 4px solid #d9534f; padding: 15px; margin: 20px 0;\">"
                    + "    <p style=\"margin: 5px 0;\"><strong>Previous Batch :</strong> " + (oldBatchName != null ? oldBatchName : "N/A") + "</p>"
                    + "    <p style=\"margin: 5px 0; color: #d9534f;\"><strong>New Batch :</strong> " + (newBatchName != null ? newBatchName : "N/A") + "</p>"
                    + "    <p style=\"margin: 5px 0;\"><strong>Course :</strong> " + (courseName != null ? courseName : "Information Technology Excellence Program (ITEP)") + "</p>"
                    + "    <p style=\"margin: 5px 0;\"><strong>New Batch Start Date :</strong> " + batchStartDate + "</p>"
                    + "    <p style=\"margin: 5px 0;\"><strong>Technical Trainer :</strong> " + (technicalTrainer != null ? technicalTrainer : "TBD") + "</p>"
                    + "  </div>"
                    + "  <p>Please ensure your availability for the commencement of the new batch. If you have any questions or concerns, please contact our administration team.</p>"
                    + "  <div style=\"margin-top: 30px;\">"
                    + "    <p>Best regards,</p>"
                    + "    <p style=\"font-family: cursive; font-size: 18px; margin: 5px 0;\">Dr. Neha Bhopatkar</p>"
                    + "    <p style=\"margin: 0;\"><strong>Dr. Neha Bhopatkar</strong><br>Associate Director HR</p>"
                    + "  </div>"
                    + "</body>"
                    + "</html>";

            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Batch change email warning: " + e.getMessage());
        }
    }
}