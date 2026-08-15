package com.example.SPT;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.example.SPT.dto.request.AttendanceRequest;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
public class TrainerAttendanceAndMaterialsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Test Today Attendance - Technical Trainer with TECHNICAL session returns 200")
    @WithMockUser(username = "trainer@spt.com", roles = {"TRAINER"})
    public void testTodayAttendanceSuccess() throws Exception {
        mockMvc.perform(get("/api/trainer/attendance/today")
                        .param("date", "2026-08-15")
                        .param("sessionType", "TECHNICAL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionType").value("TECHNICAL"))
                .andExpect(jsonPath("$.students").isArray());
    }

    @Test
    @DisplayName("Test Today Attendance - Technical Trainer requesting SOFTSKILL session returns 403")
    @WithMockUser(username = "trainer@spt.com", roles = {"TRAINER"})
    public void testTodayAttendanceSessionTypeSecurity() throws Exception {
        mockMvc.perform(get("/api/trainer/attendance/today")
                        .param("date", "2026-08-15")
                        .param("sessionType", "SOFT_SKILL"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Test Attendance History - Technical Trainer with TECHNICAL session returns 200")
    @WithMockUser(username = "trainer@spt.com", roles = {"TRAINER"})
    public void testAttendanceHistorySuccess() throws Exception {
        mockMvc.perform(get("/api/trainer/attendance/history")
                        .param("date", "2026-08-15")
                        .param("sessionType", "TECHNICAL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionType").value("TECHNICAL"))
                .andExpect(jsonPath("$.students").isArray());
    }

    @Test
    @DisplayName("Test Trainer Materials Endpoint - GET /api/trainer/materials returns 200")
    @WithMockUser(username = "trainer@spt.com", roles = {"TRAINER"})
    public void testGetTrainerMaterials() throws Exception {
        mockMvc.perform(get("/api/trainer/materials"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Test Batch Security - Unauthorized batch request returns 403")
    @WithMockUser(username = "trainer@spt.com", roles = {"TRAINER"})
    public void testAttendanceBatchAuthorizationFailure() throws Exception {
        mockMvc.perform(get("/api/trainer/attendance/today")
                        .param("batchId", "unauthorized_batch_999")
                        .param("date", "2026-08-15")
                        .param("sessionType", "TECHNICAL"))
                .andExpect(status().isForbidden());
    }

    @Autowired
    private com.example.SPT.repository.BatchRepository batchRepository;

    @Test
    @DisplayName("Test Mark Attendance and Upsert - No Duplicates Created")
    @WithMockUser(username = "trainer@spt.com", roles = {"TRAINER"})
    public void testMarkAttendanceAndUpsert() throws Exception {
        String testBatchId = batchRepository.findAll().stream().findFirst().map(com.example.SPT.entity.Batch::getId).orElse("BATCH001");

        AttendanceRequest request = AttendanceRequest.builder()
                .studentId("student@spt.com")
                .batchId(testBatchId)
                .attendanceDate(LocalDate.now())
                .sessionType("TECHNICAL")
                .status("PRESENT")
                .remarks("On time")
                .build();

        mockMvc.perform(post("/api/trainer/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PRESENT"));

        // Resubmit with updated status -> Should update cleanly (upsert)
        request.setStatus("LATE");
        request.setRemarks("Late by 5 mins");

        mockMvc.perform(post("/api/trainer/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("LATE"));
    }

    @Test
    @DisplayName("Test Student Monthly Attendance Endpoint returns 200")
    @WithMockUser(username = "trainer@spt.com", roles = {"TRAINER"})
    public void testStudentMonthlyAttendance() throws Exception {
        mockMvc.perform(get("/api/trainer/attendance/student/student@spt.com/monthly")
                        .param("month", "8")
                        .param("year", "2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId").exists())
                .andExpect(jsonPath("$.dailyRecords").isArray());
    }

    @Test
    @DisplayName("Test Study Material File Endpoint - Non-existent file returns 404 cleanly")
    @WithMockUser(username = "trainer@spt.com", roles = {"TRAINER"})
    public void testGetNonExistentMaterialFile() throws Exception {
        mockMvc.perform(get("/api/materials/nonexistentid999/file"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Test Trainer Dashboard Endpoint - GET /api/trainer/dashboard with Auth returns 200")
    @WithMockUser(username = "trainer@spt.com", roles = {"TRAINER"})
    public void testGetTrainerDashboardSuccess() throws Exception {
        mockMvc.perform(get("/api/trainer/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trainer").exists())
                .andExpect(jsonPath("$.trainer.email").value("trainer@spt.com"))
                .andExpect(jsonPath("$.totalStudents").isNumber())
                .andExpect(jsonPath("$.totalAssignments").isNumber())
                .andExpect(jsonPath("$.totalAssessments").isNumber())
                .andExpect(jsonPath("$.totalStudyMaterials").isNumber())
                .andExpect(jsonPath("$.topPerformers").isArray())
                .andExpect(jsonPath("$.latestNotices").isArray());
    }

    @Test
    @DisplayName("Test Trainer Dashboard Endpoint - GET /api/trainers/dashboard with Auth returns 200")
    @WithMockUser(username = "trainer@spt.com", roles = {"TRAINER"})
    public void testGetTrainersDashboardRouteSuccess() throws Exception {
        mockMvc.perform(get("/api/trainers/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trainer").exists())
                .andExpect(jsonPath("$.trainer.email").value("trainer@spt.com"));
    }

    @Test
    @DisplayName("Test Material Upload - JSON with Image File type returns 201 Created")
    @WithMockUser(username = "trainer@spt.com", roles = {"TRAINER"})
    public void testUploadMaterialJsonSuccess() throws Exception {
        com.example.SPT.dto.request.MaterialRequest req = com.example.SPT.dto.request.MaterialRequest.builder()
                .title("java document")
                .subject("java")
                .materialType("Image File")
                .fileName("Screenshot 2026-02-09 150417.png")
                .fileUrl("/uploads/test_screenshot.png")
                .fileSize(536268L)
                .contentType("image/png")
                .description("Sample Java screenshot")
                .build();

        mockMvc.perform(post("/api/trainer/materials")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("java document"))
                .andExpect(jsonPath("$.subject").value("java"))
                .andExpect(jsonPath("$.materialType").value("IMAGE"));
    }

    @Test
    @DisplayName("Test Material Upload - Missing File throws 400 with meaningful error")
    @WithMockUser(username = "trainer@spt.com", roles = {"TRAINER"})
    public void testUploadMaterialMissingFile() throws Exception {
        com.example.SPT.dto.request.MaterialRequest req = com.example.SPT.dto.request.MaterialRequest.builder()
                .title("java document")
                .subject("java")
                .build();

        mockMvc.perform(post("/api/trainer/materials")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test Trainer Interview Candidates - GET /api/trainer/interviews/candidates returns 200")
    @WithMockUser(username = "trainer@spt.com", roles = {"TRAINER"})
    public void testGetTrainerInterviewCandidatesSuccess() throws Exception {
        mockMvc.perform(get("/api/trainer/interviews/candidates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
