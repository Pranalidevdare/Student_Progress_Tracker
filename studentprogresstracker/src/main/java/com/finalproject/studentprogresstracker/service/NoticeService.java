package com.finalproject.studentprogresstracker.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.finalproject.studentprogresstracker.entity.Notice;
import com.finalproject.studentprogresstracker.repository.NoticeRepository;

@Service
public class NoticeService {

    @Autowired
    private NoticeRepository noticeRepository;

    // Add Notice
    public Notice addNotice(Notice notice) {

        notice.setNoticeDate(LocalDate.now());

        return noticeRepository.save(notice);
    }

    // Get All Notices
    public List<Notice> getAllNotices() {

        return noticeRepository.findAll();
    }

    // Get Notice By Id
    public Notice getNoticeById(String noticeId) {

        return noticeRepository.findById(noticeId)
                .orElseThrow(() ->
                        new RuntimeException("Notice Not Found"));
    }

    // Get Notices By Trainer
    public List<Notice> getNoticesByTrainer(String trainerId) {

        return noticeRepository.findByTrainerId(trainerId);
    }

    // Update Notice
    public Notice updateNotice(String noticeId, Notice notice) {

        Notice existingNotice = noticeRepository.findById(noticeId)
                .orElseThrow(() ->
                        new RuntimeException("Notice Not Found"));

        existingNotice.setTrainerId(notice.getTrainerId());
        existingNotice.setTitle(notice.getTitle());
        existingNotice.setDescription(notice.getDescription());
        existingNotice.setNoticeDate(notice.getNoticeDate());

        return noticeRepository.save(existingNotice);
    }

    // Delete Notice
    public String deleteNotice(String noticeId) {

        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() ->
                        new RuntimeException("Notice Not Found"));

        noticeRepository.delete(notice);

        return "Notice Deleted Successfully";
    }

}