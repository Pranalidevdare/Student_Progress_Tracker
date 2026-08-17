package com.example.SPT.controller;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mongodb.client.MongoDatabase;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class HealthControllerTest {

    @Test
    void healthEndpointShouldReportDatabaseConnectionStatus() throws Exception {
        MongoTemplate mongoTemplate = mock(MongoTemplate.class);
        MongoDatabase mongoDatabase = mock(MongoDatabase.class);
        when(mongoTemplate.getDb()).thenReturn(mongoDatabase);
        when(mongoDatabase.getName()).thenReturn("api_marketplace");

        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(new HealthController(mongoTemplate))
                .build();

        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.database").value("connected"));
    }
}
