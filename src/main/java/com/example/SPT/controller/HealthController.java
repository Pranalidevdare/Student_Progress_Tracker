package com.example.SPT.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

    private static final String DEFAULT_DATABASE = "api_marketplace";
    private final MongoTemplate mongoTemplate;

    public HealthController(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        String activeDatabase = (mongoTemplate.getDb() != null) ? mongoTemplate.getDb().getName() : DEFAULT_DATABASE;
        boolean connected = mongoTemplate.getDb() != null;

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", connected ? "ok" : "error");
        response.put("database", connected ? "connected" : "unavailable");
        response.put("connectedDatabase", activeDatabase);
        response.put("expectedDatabase", DEFAULT_DATABASE);

        return ResponseEntity.ok(response);
    }
}
