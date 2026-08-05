package com.finalproject.studentprogresstracker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.entity.Notice;
import com.finalproject.studentprogresstracker.service.NoticeService;

@RestController
@RequestMapping("/api/notices")
@CrossOrigin(origins = "*")
public class NoticeController {

    @Autowired
    private NoticeService noticeService;

    // Add Notice
    @PostMapping("/add")
    public ResponseEntity<Notice> addNotice(
            @RequestBody Notice notice) {

        return new ResponseEntity<>(
                noticeService.addNotice(notice),
                HttpStatus.CREATED);
    }

    // Get All Notices
    @GetMapping("/all")
    public ResponseEntity<List<Notice>> getAllNotices() {

        return ResponseEntity.ok(
                noticeService.getAllNotices());
    }

    // Get Notice By Id
    @GetMapping("/{noticeId}")
    public ResponseEntity<Notice> getNoticeById(
            @PathVariable String noticeId) {

        return ResponseEntity.ok(
                noticeService.getNoticeById(noticeId));
    }

    // Get Notices By Trainer
    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<List<Notice>> getNoticesByTrainer(
            @PathVariable String trainerId) {

        return ResponseEntity.ok(
                noticeService.getNoticesByTrainer(trainerId));
    }

    // Update Notice
    @PutMapping("/update/{noticeId}")
    public ResponseEntity<Notice> updateNotice(
            @PathVariable String noticeId,
            @RequestBody Notice notice) {

        return ResponseEntity.ok(
                noticeService.updateNotice(noticeId, notice));
    }

    // Delete Notice
    @DeleteMapping("/delete/{noticeId}")
    public ResponseEntity<String> deleteNotice(
            @PathVariable String noticeId) {

        return ResponseEntity.ok(
                noticeService.deleteNotice(noticeId));
    }

}