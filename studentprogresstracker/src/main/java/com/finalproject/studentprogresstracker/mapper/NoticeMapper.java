package com.finalproject.studentprogresstracker.mapper;

import org.springframework.stereotype.Component;

import com.finalproject.studentprogresstracker.dto.response.NoticeResponse;
import com.finalproject.studentprogresstracker.entity.Notice;

@Component
public class NoticeMapper {

    public NoticeResponse toResponse(Notice notice) {

        if (notice == null) {
            return null;
        }

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