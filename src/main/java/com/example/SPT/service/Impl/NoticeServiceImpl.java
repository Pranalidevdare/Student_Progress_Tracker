package com.example.SPT.service.Impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.SPT.dto.request.NoticeRequest;
import com.example.SPT.dto.response.NoticeResponse;
import com.example.SPT.entity.Notice;
import com.example.SPT.repository.NoticeRepository;
import com.example.SPT.service.NoticeService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NoticeServiceImpl implements NoticeService {

    private final NoticeRepository noticeRepository;

    @Override
    public NoticeResponse createNotice(NoticeRequest request) {

        Notice notice = Notice.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .batchId(request.getBatchId())
                .trainerId(request.getTrainerId())
                .trainerName(request.getTrainerName())
                .publishDate(request.getPublishDate())
                .expiryDate(request.getExpiryDate())
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return convertToResponse(
                noticeRepository.save(notice));
    }

    @Override
    public NoticeResponse updateNotice(String id, NoticeRequest request) {

        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Notice not found with id : " + id));

        notice.setTitle(request.getTitle());
        notice.setDescription(request.getDescription());
        notice.setCategory(request.getCategory());
        notice.setPriority(request.getPriority());
        notice.setBatchId(request.getBatchId());
        notice.setTrainerId(request.getTrainerId());
        notice.setTrainerName(request.getTrainerName());
        notice.setPublishDate(request.getPublishDate());
        notice.setExpiryDate(request.getExpiryDate());
        notice.setUpdatedAt(LocalDateTime.now());

        return convertToResponse(
                noticeRepository.save(notice));
    }

    @Override
    public void deleteNotice(String id) {

        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Notice not found with id : " + id));

        noticeRepository.delete(notice);
    }

    @Override
    public NoticeResponse getNoticeById(String id) {

        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Notice not found with id : " + id));

        return convertToResponse(notice);
    }

    @Override
    public List<NoticeResponse> getAllNotices() {

        return noticeRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<NoticeResponse> getActiveNotices() {

        return noticeRepository.findByActiveTrue()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<NoticeResponse> getNoticesByBatch(String batchId) {

        return noticeRepository.findByBatchIdAndActiveTrue(batchId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<NoticeResponse> getLatestNotices() {

        return noticeRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<NoticeResponse> getImportantNotices() {

        return noticeRepository.findByPriorityAndActiveTrue("HIGH")
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<NoticeResponse> getCategoryNotices(String category) {

        return noticeRepository.findByCategoryAndActiveTrue(category)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<NoticeResponse> getTrainerNotices(String trainerId) {

        return noticeRepository.findByTrainerId(trainerId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private NoticeResponse convertToResponse(Notice notice) {

        return NoticeResponse.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .description(notice.getDescription())
                .category(notice.getCategory())
                .priority(notice.getPriority())
                .batchId(notice.getBatchId())
                .trainerId(notice.getTrainerId())
                .trainerName(notice.getTrainerName())
                .publishDate(notice.getPublishDate())
                .expiryDate(notice.getExpiryDate())
                .active(notice.getActive())
                .createdAt(notice.getCreatedAt())
                .updatedAt(notice.getUpdatedAt())
                .build();
    }
}