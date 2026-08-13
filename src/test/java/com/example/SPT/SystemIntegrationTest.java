package com.example.SPT;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.example.SPT.dto.request.LoginRequest;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
public class SystemIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Test Auth API - Successful Admin Login")
    public void testAdminLoginSuccess() throws Exception {
        LoginRequest loginRequest = new LoginRequest("admin@spt.com", "admin123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.email").value("admin@spt.com"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    @DisplayName("Test Auth API - Successful Student Login")
    public void testStudentLoginSuccess() throws Exception {
        LoginRequest loginRequest = new LoginRequest("student@spt.com", "student123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.role").value("STUDENT"));
    }

    @Test
    @DisplayName("Test Admin Dashboard API - Authorized Access")
    @WithMockUser(username = "admin@spt.com", roles = {"ADMIN"})
    public void testAdminDashboard() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Test Admin Students List API")
    @WithMockUser(username = "admin@spt.com", roles = {"ADMIN"})
    public void testAdminGetStudents() throws Exception {
        mockMvc.perform(get("/api/admin/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Test Student Notices API")
    @WithMockUser(username = "student@spt.com", roles = {"STUDENT"})
    public void testGetActiveNotices() throws Exception {
        mockMvc.perform(get("/api/student/notices"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Test Candidate Aptitude Questions API - Public Access")
    public void testPublicAptitudeQuestions() throws Exception {
        mockMvc.perform(get("/api/aptitude/questions"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Test Aptitude Start API accepts application number as candidate identifier")
    public void testAptitudeStartByApplicationNumber() throws Exception {
        mockMvc.perform(post("/api/aptitude/start/APP2026002"))
                .andExpect(status().isOk());
    }
}
