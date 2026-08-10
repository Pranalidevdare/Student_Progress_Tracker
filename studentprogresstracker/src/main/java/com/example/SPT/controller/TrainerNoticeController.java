package com.example.SPT.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.request.NoticeRequest;
import com.example.SPT.dto.response.NoticeResponse;
import com.example.SPT.service.NoticeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trainer/notices")
@RequiredArgsConstructor
@Validated
public class TrainerNoticeController {

    private final NoticeService noticeService;

    // Create Notice
    @PostMapping
    public ResponseEntity<NoticeResponse> createNotice(
            @Valid @RequestBody NoticeRequest request) {

        return new ResponseEntity<>(
                noticeService.createNotice(request),
                HttpStatus.CREATED);
    }

    // Update Notice
    @PutMapping("/{id}")
    public ResponseEntity<NoticeResponse> updateNotice(
            @PathVariable String id,
            @Valid @RequestBody NoticeRequest request) {

        return ResponseEntity.ok(
                noticeService.updateNotice(id, request));
    }

    // Delete Notice
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNotice(
            @PathVariable String id) {

        noticeService.deleteNotice(id);

        return ResponseEntity.ok("Notice deleted successfully.");
    }

    // Get Notice By Id
    @GetMapping("/{id}")
    public ResponseEntity<NoticeResponse> getNoticeById(
            @PathVariable String id) {

        return ResponseEntity.ok(
                noticeService.getNoticeById(id));
    }

    // Get All Notices
    @GetMapping
    public ResponseEntity<List<NoticeResponse>> getAllNotices() {

        return ResponseEntity.ok(
                noticeService.getAllNotices());
    }

    // Get Notices Created By Trainer
    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<List<NoticeResponse>> getTrainerNotices(
            @PathVariable String trainerId) {

        return ResponseEntity.ok(
                noticeService.getTrainerNotices(trainerId));
    }

}