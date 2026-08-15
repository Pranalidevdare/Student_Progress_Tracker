package com.example.SPT.service;

import java.util.List;

import com.example.SPT.dto.response.NotificationResponse;

public interface NotificationService {

    List<NotificationResponse> getNotificationsForStudent(String studentIdentifier);

    long getUnreadCount(String studentIdentifier);

    void markAsRead(String notificationId);

    void markAllAsRead(String studentIdentifier);

    void createBatchNotifications(String batchId, String title, String message, String type, String relatedEntityId);

    void createBatchNotifications(String trainerId, String batchId, String title, String message, String type, String referenceType, String referenceId);
}
