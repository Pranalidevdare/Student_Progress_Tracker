package com.example.SPT.service.Impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.SPT.dto.response.NotificationResponse;
import com.example.SPT.entity.Notification;
import com.example.SPT.entity.Student;
import com.example.SPT.repository.NotificationRepository;
import com.example.SPT.repository.StudentRepository;
import com.example.SPT.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service("notificationService")
@org.springframework.context.annotation.Primary
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final StudentRepository studentRepository;

    @Override
    public List<NotificationResponse> getNotificationsForStudent(String studentIdentifier) {
        List<String> possibleIds = getPossibleStudentIdentifiers(studentIdentifier);
        log.info("Fetching notifications for student identifiers: {}", possibleIds);

        List<Notification> notifications = notificationRepository.findByStudentIdInOrderByCreatedAtDesc(possibleIds);
        return notifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public long getUnreadCount(String studentIdentifier) {
        List<String> possibleIds = getPossibleStudentIdentifiers(studentIdentifier);
        return notificationRepository.countByStudentIdInAndReadFalse(possibleIds);
    }

    @Override
    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
            log.info("Marked notification {} as read", notificationId);
        });
    }

    @Override
    public void markAllAsRead(String studentIdentifier) {
        List<String> possibleIds = getPossibleStudentIdentifiers(studentIdentifier);
        List<Notification> list = notificationRepository.findByStudentIdInOrderByCreatedAtDesc(possibleIds);
        list.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(list);
        log.info("Marked all notifications as read for identifiers: {}", possibleIds);
    }

    @Override
    public void createBatchNotifications(String batchId, String title, String message, String type, String relatedEntityId) {
        createBatchNotifications(null, batchId, title, message, type, getReferenceTypeFromNotificationType(type), relatedEntityId);
    }

    @Override
    public void createBatchNotifications(String trainerId, String batchId, String title, String message, String type, String referenceType, String referenceId) {
        if (batchId == null || batchId.trim().isEmpty()) {
            log.warn("Cannot create batch notifications: batchId is blank");
            return;
        }

        List<Student> batchStudents = studentRepository.findByBatchId(batchId);
        if (batchStudents == null || batchStudents.isEmpty()) {
            log.info("No active students found in batch '{}' for notification generation", batchId);
            return;
        }

        List<Notification> notificationsToSave = new ArrayList<>();

        for (Student student : batchStudents) {
            String studentPrimaryId = student.getId() != null ? student.getId() : student.getEmail();

            // Duplicate Prevention: Check if notification already exists for this student & reference ID
            boolean existsByRelated = referenceId != null && notificationRepository.existsByStudentIdAndRelatedEntityIdAndType(studentPrimaryId, referenceId, type);
            boolean existsByRef = referenceId != null && notificationRepository.existsByStudentIdAndReferenceIdAndType(studentPrimaryId, referenceId, type);

            if (existsByRelated || existsByRef) {
                log.info("Skipping duplicate notification for student '{}', referenceId '{}', type '{}'", studentPrimaryId, referenceId, type);
                continue;
            }

            Notification notification = Notification.builder()
                    .studentId(studentPrimaryId)
                    .title(title)
                    .message(message)
                    .type(type)
                    .relatedEntityId(referenceId)
                    .referenceId(referenceId)
                    .referenceType(referenceType)
                    .batchId(batchId)
                    .trainerId(trainerId)
                    .read(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            notificationsToSave.add(notification);

            // Also create a secondary notification record mapped to student email if student.getId() and student.getEmail() differ
            if (student.getEmail() != null && !student.getEmail().equalsIgnoreCase(studentPrimaryId)) {
                boolean emailExists = referenceId != null && notificationRepository.existsByStudentIdAndRelatedEntityIdAndType(student.getEmail(), referenceId, type);
                if (!emailExists) {
                    Notification emailNotification = Notification.builder()
                            .studentId(student.getEmail())
                            .title(title)
                            .message(message)
                            .type(type)
                            .relatedEntityId(referenceId)
                            .referenceId(referenceId)
                            .referenceType(referenceType)
                            .batchId(batchId)
                            .trainerId(trainerId)
                            .read(false)
                            .createdAt(LocalDateTime.now())
                            .build();
                    notificationsToSave.add(emailNotification);
                }
            }
        }

        if (!notificationsToSave.isEmpty()) {
            notificationRepository.saveAll(notificationsToSave);
            log.info("Successfully created {} notifications for batch '{}'", notificationsToSave.size(), batchId);
        }
    }

    private List<String> getPossibleStudentIdentifiers(String studentIdentifier) {
        List<String> ids = new ArrayList<>();
        if (studentIdentifier == null || studentIdentifier.trim().isEmpty()) {
            ids.add("STUDENT001");
            return ids;
        }

        ids.add(studentIdentifier.trim());

        // Attempt to find student in database to include student.getId(), student.getEmail(), student.getStudentId()
        Optional<Student> stuOpt = studentRepository.findByEmail(studentIdentifier.trim());
        if (stuOpt.isEmpty()) {
            stuOpt = studentRepository.findById(studentIdentifier.trim());
        }

        if (stuOpt.isPresent()) {
            Student s = stuOpt.get();
            if (s.getId() != null && !ids.contains(s.getId())) ids.add(s.getId());
            if (s.getEmail() != null && !ids.contains(s.getEmail())) ids.add(s.getEmail());
        }

        return ids;
    }

    private String getReferenceTypeFromNotificationType(String type) {
        if (type == null) return "GENERAL";
        return switch (type.toUpperCase()) {
            case "ASSIGNMENT_CREATED", "NEW_ASSIGNMENT" -> "ASSIGNMENT";
            case "ASSESSMENT_CREATED", "NEW_ASSESSMENT" -> "ASSESSMENT";
            case "MATERIAL_UPLOADED", "NEW_MATERIAL" -> "MATERIAL";
            default -> "GENERAL";
        };
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .studentId(n.getStudentId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .relatedEntityId(n.getRelatedEntityId() != null ? n.getRelatedEntityId() : n.getReferenceId())
                .referenceId(n.getReferenceId() != null ? n.getReferenceId() : n.getRelatedEntityId())
                .referenceType(n.getReferenceType() != null ? n.getReferenceType() : getReferenceTypeFromNotificationType(n.getType()))
                .batchId(n.getBatchId())
                .trainerId(n.getTrainerId())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
