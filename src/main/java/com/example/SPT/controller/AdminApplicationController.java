package com.example.SPT.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.SPT.dto.request.ApplicationStatusUpdateRequest;
import com.example.SPT.dto.request.ApplicationUpdateRequest;
import com.example.SPT.dto.request.BatchAssignmentRequest;
import com.example.SPT.dto.response.ApplicationResponse;
import com.example.SPT.enums.ApplicationStatus;
import com.example.SPT.service.ApplicationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.example.SPT.dto.response.StudentResponse;
@RestController
@RequestMapping("/api/admin/applications")
@RequiredArgsConstructor
@Validated
@CrossOrigin(origins = "*")
public class AdminApplicationController {

    private final ApplicationService applicationService;

    // GET ALL APPLICATIONS

    @GetMapping("/getAll")
    public ResponseEntity<List<ApplicationResponse>> getAllApplications() {

        return ResponseEntity.ok(
                applicationService.getAllApplications()
        );
    }

    // GET APPLICATION BY ID

    @GetMapping("/getById/{id}")
    public ResponseEntity<ApplicationResponse> getApplicationById(
            @PathVariable String id) {

        return ResponseEntity.ok(
                applicationService.getApplicationById(id)
        );
    }

    // GET BY APPLICATION NUMBER

    @GetMapping("/getByApplicationNumber/{applicationNumber}")
    public ResponseEntity<ApplicationResponse>
            getApplicationByApplicationNumber(
                    @PathVariable String applicationNumber) {

        return ResponseEntity.ok(
                applicationService
                        .getApplicationByApplicationNumber(
                                applicationNumber
                        )
        );
    }

    // SEARCH BY NAME

    @GetMapping("/searchByName")
    public ResponseEntity<List<ApplicationResponse>> searchByName(
            @RequestParam String name) {

        return ResponseEntity.ok(
                applicationService.searchByName(name)
        );
    }

    // GET BY STATUS

    @GetMapping("/getByStatus/{status}")
    public ResponseEntity<List<ApplicationResponse>>
            getApplicationsByStatus(
                    @PathVariable ApplicationStatus status) {

        return ResponseEntity.ok(
                applicationService.getApplicationsByStatus(status)
        );
    }
    
    @GetMapping("/eligible-for-aptitude")
    public ResponseEntity<List<ApplicationResponse>>
    getEligibleForAptitude() {

        List<ApplicationResponse> applications =
                applicationService.getApplicationsByStatus(
                        ApplicationStatus.ELIGIBLE_FOR_APTITUDE);

        return ResponseEntity.ok(applications);
    }

    // UPDATE APPLICATION

    @PutMapping("/update/{id}")
    public ResponseEntity<ApplicationResponse> updateApplication(
            @PathVariable String id,
            @Valid @RequestBody ApplicationUpdateRequest request) {

        return ResponseEntity.ok(
                applicationService.updateApplication(
                        id,
                        request
                )
        );
    }

    // UPDATE APPLICATION STATUS

    @PatchMapping("/updateStatus/{id}")
    public ResponseEntity<ApplicationResponse>
            updateApplicationStatus(
                    @PathVariable String id,
                    @Valid @RequestBody
                    ApplicationStatusUpdateRequest request) {

        return ResponseEntity.ok(
                applicationService.updateApplicationStatus(
                        id,
                        request
                )
        );
    }

    // DELETE APPLICATION

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteApplication(
            @PathVariable String id) {

        applicationService.deleteApplication(id);

        return ResponseEntity.noContent().build();
    }

    /**
     * Assign a batch to an application
     */
    @PostMapping("/assign-batch")
    public ResponseEntity<ApplicationResponse> assignBatch(
            @Valid @RequestBody BatchAssignmentRequest request) {
        
        ApplicationResponse response = applicationService.assignBatch(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Change/reassign batch for an application
     */
    @PatchMapping("/change-batch")
    public ResponseEntity<ApplicationResponse> changeBatch(
            @Valid @RequestBody BatchAssignmentRequest request) {
        
        ApplicationResponse response = applicationService.changeBatch(request);
        return ResponseEntity.ok(response);
    }
    
 // CREATE STUDENT FROM SELECTED APPLICATION

    @PostMapping("/{id}/create-student")
    public ResponseEntity<StudentResponse> createStudentFromSelectedApplication(
            @PathVariable String id) {

        StudentResponse response =
                applicationService
                        .createStudentFromSelectedApplication(id);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // GET ENROLLMENT LETTER HTML FORMAT
    @GetMapping(value = "/{id}/enrollment-letter", produces = org.springframework.http.MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getEnrollmentLetter(@PathVariable String id) {
        ApplicationResponse app = applicationService.getApplicationById(id);
        String firstName = app.getFullName() != null && app.getFullName().contains(" ") ?
                app.getFullName().split(" ")[0] : (app.getFullName() != null ? app.getFullName() : "Student");
        String currentDate = java.time.LocalDate.now().format(
                java.time.format.DateTimeFormatter.ofPattern("MMMM dd, yyyy"));

        String html = "<html>"
                + "<head><style>body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 30px; } "
                + ".header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #d9534f; padding-bottom: 15px; margin-bottom: 30px; } "
                + ".logo { font-size: 24px; font-weight: bold; color: #111; } "
                + ".logo-sub { color: #d9534f; font-size: 14px; font-weight: normal; } "
                + ".tagline { text-align: right; color: #c9302c; font-size: 18px; font-weight: bold; } "
                + ".tagline-sub { color: #333; font-weight: normal; font-size: 14px; } "
                + ".title { text-align: center; font-size: 22px; font-weight: bold; margin: 30px 0; letter-spacing: 1px; } "
                + ".details-box { background-color: #f9f9f9; border-left: 4px solid #d9534f; padding: 18px; margin: 25px 0; } "
                + ".bullet-points { padding-left: 20px; } .bullet-points li { margin-bottom: 8px; }</style></head>"
                + "<body>"
                + "  <div class=\"header\">"
                + "    <div class=\"logo\">InfoBeans<br><span class=\"logo-sub\">Foundation</span></div>"
                + "    <div class=\"tagline\">उन्नत राष्ट्र की कल्पना<br><span class=\"tagline-sub\">कम्प्यूटर साक्षरता घर-घर पहुँचाना</span></div>"
                + "  </div>"
                + "  <div class=\"title\">Enrollment Letter</div>"
                + "  <div style=\"margin-bottom: 20px;\">" + currentDate + "</div>"
                + "  <div style=\"margin-bottom: 20px;\"><strong>" + app.getFullName() + "</strong><br>"
                + (app.getCollegeName() != null ? app.getCollegeName() : "") + "<br>"
                + "Mobile: " + app.getMobile() + "</div>"
                + "  <div style=\"font-size: 16px; font-weight: 600; margin-bottom: 15px;\">Dear " + firstName + ",</div>"
                + "  <p><strong>Congratulations!</strong></p>"
                + "  <p>We are delighted to inform you that you have been selected for the one year <strong>Information Technology Excellence Program (ITEP)</strong> at InfoBeans Foundation, Pune.</p>"
                + "  <p>Your performance in the aptitude test and personal interview have demonstrated your potential and commitment towards advancing in the field of information technology. We believe that your participation in this program will open up new avenues of opportunity for you and empower you to shape a brighter future.</p>"
                + "  <p>The Information Technology Excellence Program (ITEP) is designed to provide comprehensive training in various aspects of information technology over the course of one year. Through a combination of theoretical knowledge and practical hands-on experience, you will gain valuable insights into different tech stacks, latest technologies and industry trends. During the course, you will be guided by experienced instructors who are committed to your success.</p>"
                + "  <p>Please refer to the program schedule and other relevant information. We kindly request you to ensure your availability for the commencement of the program.</p>"
                + "  <div class=\"details-box\">"
                + "    <p style=\"margin: 5px 0;\"><strong>Batch :</strong> " + (app.getAssignedBatchName() != null ? app.getAssignedBatchName() : "N/A") + "</p>"
                + "    <p style=\"margin: 5px 0;\"><strong>Batch Start Date :</strong> Monday, " + currentDate + "</p>"
                + "    <p style=\"margin: 5px 0;\"><strong>Address :</strong> InfoBeans Foundation , Pune / ISBM College of Engineering . 4th Floor . Survey No.44/1/2, Taluka Mulshi, Pashan Sus Road, Nande, Maharashtra 412115</p>"
                + "    <p style=\"margin: 5px 0;\"><strong>Contact Person :</strong> Omkar Patankar Sir, Mobile: 9981336599</p>"
                + "  </div>"
                + "  <p>Your participation in this program will necessitate a high level of dedication and commitment, potentially requiring adjustments to your current engagements. However, we assure you that the knowledge and skills you will acquire during this journey will prove invaluable in shaping your future career.</p>"
                + "  <p>Once again, congratulations on your selection! We look forward to welcoming you to the Information Technology Excellence Program and witnessing your growth and success.</p>"
                + "  <p><strong>Please Note:</strong></p>"
                + "  <ul class=\"bullet-points\">"
                + "    <li>Failure to report on the batch commencement date without prior notification may result in the cancellation of your enrollment</li>"
                + "    <li>If any discrepancy is identified in the information or documents provided at any point during the program, your registration may be subject to immediate cancellation</li>"
                + "    <li>In the event of any change in the commencement date, you will be promptly informed through official channels</li>"
                + "  </ul>"
                + "  <div style=\"margin-top: 40px;\">"
                + "    <p>Best regards,</p>"
                + "    <p style=\"font-family: cursive; font-size: 20px; color: #1a252f; margin: 5px 0;\">Dr. Neha Bhopatkar</p>"
                + "    <p style=\"margin: 0;\"><strong>Dr. Neha Bhopatkar</strong><br>Associate Director HR</p>"
                + "  </div>"
                + "</body>"
                + "</html>";

        return ResponseEntity.ok(html);
    }
}