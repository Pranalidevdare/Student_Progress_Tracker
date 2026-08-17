package com.example.SPT.service;

import java.util.List;

import com.example.SPT.dto.request.NoticeRequest;
import com.example.SPT.dto.response.NoticeResponse;

public interface NoticeService {

    // Trainer APIs

    NoticeResponse createNotice(NoticeRequest request);

    NoticeResponse updateNotice(String id, NoticeRequest request);

    void deleteNotice(String id);

    List<NoticeResponse> getTrainerNotices(String trainerId);

    // Common APIs

    NoticeResponse getNoticeById(String id);

    List<NoticeResponse> getAllNotices();

    // Student APIs

    List<NoticeResponse> getActiveNotices();

    List<NoticeResponse> getNoticesByBatch(String batchId);

    List<NoticeResponse> getLatestNotices();

    List<NoticeResponse> getImportantNotices();

    List<NoticeResponse> getCategoryNotices(String category);

}