package com.example.SPT.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.response.NoticeResponse;
import com.example.SPT.service.NoticeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student/notices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentNoticeController {

    private final NoticeService noticeService;

    // View all active notices
    @GetMapping
    public ResponseEntity<List<NoticeResponse>> getActiveNotices() {

        return ResponseEntity.ok(
                noticeService.getActiveNotices());
    }

    // View notice by id
    @GetMapping("/{id}")
    public ResponseEntity<NoticeResponse> getNoticeById(
            @PathVariable String id) {

        return ResponseEntity.ok(
                noticeService.getNoticeById(id));
    }

    // View notices by batch
    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<NoticeResponse>> getNoticesByBatch(
            @PathVariable String batchId) {

        return ResponseEntity.ok(
                noticeService.getNoticesByBatch(batchId));
    }

    // Latest notices
    @GetMapping("/latest")
    public ResponseEntity<List<NoticeResponse>> getLatestNotices() {

        return ResponseEntity.ok(
                noticeService.getLatestNotices());
    }

    // Important notices
    @GetMapping("/important")
    public ResponseEntity<List<NoticeResponse>> getImportantNotices() {

        return ResponseEntity.ok(
                noticeService.getImportantNotices());
    }

    // Notices by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<NoticeResponse>> getCategoryNotices(
            @PathVariable String category) {

        return ResponseEntity.ok(
                noticeService.getCategoryNotices(category));
    }

}