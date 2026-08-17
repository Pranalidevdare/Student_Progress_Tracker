package com.example.SPT.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.SPT.entity.Notification;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByStudentIdOrderByCreatedAtDesc(String studentId);

    List<Notification> findByStudentIdInOrderByCreatedAtDesc(List<String> studentIds);

    List<Notification> findByBatchIdOrderByCreatedAtDesc(String batchId);

    long countByStudentIdAndReadFalse(String studentId);

    long countByStudentIdInAndReadFalse(List<String> studentIds);

    boolean existsByStudentIdAndRelatedEntityIdAndType(String studentId, String relatedEntityId, String type);

    boolean existsByStudentIdAndReferenceIdAndType(String studentId, String referenceId, String type);
}
