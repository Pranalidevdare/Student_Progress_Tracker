package com.example.SPT.service.Impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.SPT.dto.request.MaterialRequest;
import com.example.SPT.dto.response.MaterialResponse;
import com.example.SPT.entity.Batch;
import com.example.SPT.entity.StudyMaterial;
import com.example.SPT.entity.Trainer;
import com.example.SPT.entity.User;
import com.example.SPT.mapper.MaterialMapper;
import com.example.SPT.repository.BatchRepository;
import com.example.SPT.repository.StudyMaterialRepository;
import com.example.SPT.repository.TrainerRepository;
import com.example.SPT.repository.UserRepository;
import com.example.SPT.service.NotificationService;
import com.example.SPT.service.StudyMaterialService;
import com.example.SPT.util.FileUploadUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service("studyMaterialService")
@org.springframework.context.annotation.Primary
@RequiredArgsConstructor
@Slf4j
public class StudyMaterialServiceImpl implements StudyMaterialService {

    private final StudyMaterialRepository studyMaterialRepository;
    private final TrainerRepository trainerRepository;
    private final UserRepository userRepository;
    private final BatchRepository batchRepository;
    private final MaterialMapper materialMapper;
    private final NotificationService notificationService;

    private static final long MAX_FILE_SIZE = 25 * 1024 * 1024L; // 25 MB
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "doc", "docx", "ppt", "pptx", "png", "jpg", "jpeg", "txt", "zip"
    );

    @Override
    public MaterialResponse uploadMaterial(MaterialRequest request) {
        return uploadMaterial(request, null);
    }

    @Override
    public MaterialResponse uploadMaterial(MaterialRequest request, String trainerEmail) {
        if (request == null) {
            throw new IllegalArgumentException("Material request cannot be null.");
        }

        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Material title is required.");
        }

        if (request.getSubject() == null || request.getSubject().trim().isEmpty()) {
            throw new IllegalArgumentException("Subject is required.");
        }

        if (request.getFileUrl() == null || request.getFileUrl().trim().isEmpty()) {
            throw new IllegalArgumentException("File is mandatory. Please select a file to upload.");
        }

        Trainer trainer = getAuthenticatedTrainer(trainerEmail);
        String trainerIdVal = trainer != null ? trainer.getId() : (request.getTrainerId() != null ? request.getTrainerId() : "TRN001");
        String trainerNameVal = trainer != null ? (trainer.getFirstName() + " " + (trainer.getLastName() != null ? trainer.getLastName() : "")).trim() : "Faculty Trainer";

        Batch resolvedBatch = resolveTrainerBatch(trainerEmail, request.getBatchId());
        if (resolvedBatch == null && (request.getBatchId() == null || request.getBatchId().isBlank())) {
            throw new IllegalArgumentException("Trainer is not assigned to a batch.");
        }

        String effectiveBatchId = resolvedBatch != null ? resolvedBatch.getId() : request.getBatchId();
        String normalizedType = normalizeMaterialType(request.getMaterialType(), request.getFileName());

        log.info("Material Upload - trainer: '{}', trainerId: '{}', batchId: '{}', fileName: '{}', fileSize: {}, contentType: '{}', materialType: '{}'",
                trainerEmail, trainerIdVal, effectiveBatchId, request.getFileName(), request.getFileSize(), request.getContentType(), normalizedType);

        StudyMaterial material = StudyMaterial.builder()
                .trainerId(trainerIdVal)
                .trainerName(trainerNameVal)
                .batchId(effectiveBatchId)
                .title(request.getTitle().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : "")
                .subject(request.getSubject().trim())
                .materialType(normalizedType)
                .fileName(request.getFileName() != null ? request.getFileName().trim() : "Document.pdf")
                .fileUrl(request.getFileUrl().trim())
                .fileSize(request.getFileSize())
                .contentType(request.getContentType())
                .uploadedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        StudyMaterial savedMaterial = studyMaterialRepository.save(material);
        log.info("Saved Study Material: ID={}, Title={}, BatchId={}", savedMaterial.getId(), savedMaterial.getTitle(), savedMaterial.getBatchId());

        // Notify batch students
        try {
            notificationService.createBatchNotifications(
                savedMaterial.getTrainerId(),
                savedMaterial.getBatchId(),
                "New Study Material",
                savedMaterial.getTitle() + " has been uploaded for your batch.",
                "MATERIAL",
                "MATERIAL",
                savedMaterial.getId()
            );
        } catch (Exception e) {
            log.error("Failed to send study material notifications: {}", e.getMessage());
        }

        return materialMapper.toResponse(savedMaterial);
    }

    @Override
    public MaterialResponse uploadMaterialMultipart(MaterialRequest request, MultipartFile file, String trainerEmail) {
        if (file == null || file.isEmpty()) {
            if (request == null || request.getFileUrl() == null || request.getFileUrl().trim().isEmpty()) {
                throw new IllegalArgumentException("File is mandatory. Please select a file to upload.");
            }
            return uploadMaterial(request, trainerEmail);
        }

        if (request == null) {
            request = new MaterialRequest();
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File exceeds 25 MB.");
        }

        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Unsupported file type.");
        }

        String savedFileUrl = null;
        try {
            savedFileUrl = FileUploadUtil.uploadFile(file);
            request.setFileUrl(savedFileUrl);
            request.setFileName(originalName);
            request.setFileSize(file.getSize());
            request.setContentType(file.getContentType());
            if (request.getMaterialType() == null || request.getMaterialType().isBlank()) {
                request.setMaterialType(detectMaterialType(extension));
            }
            return uploadMaterial(request, trainerEmail);
        } catch (Exception e) {
            if (savedFileUrl != null && savedFileUrl.startsWith("/uploads/")) {
                try {
                    Path p = Paths.get("uploads").resolve(savedFileUrl.substring("/uploads/".length()));
                    Files.deleteIfExists(p);
                } catch (Exception ignored) {}
            }
            if (e instanceof IllegalArgumentException) {
                throw (IllegalArgumentException) e;
            }
            throw new RuntimeException("Failed to store file on server: " + e.getMessage(), e);
        }
    }

    @Override
    public MaterialResponse updateMaterial(String id, MaterialRequest request) {
        return updateMaterial(id, request, null);
    }

    @Override
    public MaterialResponse updateMaterial(String id, MaterialRequest request, String trainerEmail) {
        StudyMaterial material = studyMaterialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Study Material not found with id : " + id));

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            material.setTitle(request.getTitle().trim());
        }

        if (request.getSubject() != null && !request.getSubject().trim().isEmpty()) {
            material.setSubject(request.getSubject().trim());
        }

        if (request.getDescription() != null) {
            material.setDescription(request.getDescription().trim());
        }

        if (request.getMaterialType() != null) {
            material.setMaterialType(normalizeMaterialType(request.getMaterialType(), request.getFileName()));
        }

        if (request.getFileName() != null && !request.getFileName().isBlank()) {
            material.setFileName(request.getFileName());
        }
        if (request.getFileUrl() != null && !request.getFileUrl().isBlank()) {
            material.setFileUrl(request.getFileUrl());
        }
        if (request.getFileSize() != null) {
            material.setFileSize(request.getFileSize());
        }
        if (request.getContentType() != null) {
            material.setContentType(request.getContentType());
        }
        material.setUpdatedAt(LocalDateTime.now());

        StudyMaterial updatedMaterial = studyMaterialRepository.save(material);
        return materialMapper.toResponse(updatedMaterial);
    }

    @Override
    public void deleteMaterial(String id) {
        StudyMaterial material = studyMaterialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Study Material not found with id : " + id));

        studyMaterialRepository.delete(material);
        log.info("Deleted Study Material ID: {}", id);
    }

    @Override
    public List<MaterialResponse> getMaterialsByBatch(String batchId) {
        log.info("Fetching study materials for batchId: {}", batchId);
        if (batchId == null || batchId.isBlank()) {
            return Collections.emptyList();
        }
        List<StudyMaterial> materials = studyMaterialRepository.findByBatchId(batchId);

        if (materials == null || materials.isEmpty()) {
            Optional<Batch> batchOpt = batchRepository.findById(batchId);
            if (batchOpt.isPresent()) {
                String batchName = batchOpt.get().getBatchName();
                materials = studyMaterialRepository.findAll().stream()
                        .filter(m -> batchId.equalsIgnoreCase(m.getBatchId()) || (batchName != null && batchName.equalsIgnoreCase(m.getBatchId())))
                        .collect(Collectors.toList());
            }
        }

        if (materials == null) {
            return Collections.emptyList();
        }

        return materials.stream()
                .map(materialMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaterialResponse> getMaterialsForTrainer(String requestedBatchId, String trainerEmail) {
        log.info("Fetching study materials for trainer: '{}', requested batch: '{}'", trainerEmail, requestedBatchId);
        Batch batch = resolveTrainerBatch(trainerEmail, requestedBatchId);
        if (batch == null) {
            return Collections.emptyList();
        }

        String effectiveBatchId = batch.getId();
        List<StudyMaterial> materials = studyMaterialRepository.findByBatchId(effectiveBatchId);

        if (materials == null || materials.isEmpty()) {
            String batchName = batch.getBatchName();
            materials = studyMaterialRepository.findAll().stream()
                    .filter(m -> (effectiveBatchId != null && effectiveBatchId.equalsIgnoreCase(m.getBatchId())) ||
                                 (batchName != null && batchName.equalsIgnoreCase(m.getBatchId())))
                    .collect(Collectors.toList());
        }

        if (materials == null) {
            return Collections.emptyList();
        }

        return materials.stream()
                .map(materialMapper::toResponse)
                .collect(Collectors.toList());
    }

    private Trainer getAuthenticatedTrainer(String trainerEmail) {
        if (trainerEmail == null || trainerEmail.trim().isEmpty()) {
            return null;
        }
        return trainerRepository.findByEmail(trainerEmail).orElse(null);
    }

    private Batch resolveTrainerBatch(String trainerEmail, String requestedBatchId) {
        User u = (trainerEmail != null && !trainerEmail.isBlank())
                ? userRepository.findByEmail(trainerEmail).orElse(null)
                : null;

        boolean isAdmin = u != null && u.getRole() == com.example.SPT.enums.Role.ADMIN;

        // 1. If admin and requestedBatchId provided, allow any valid batch
        if (isAdmin && requestedBatchId != null && !requestedBatchId.isBlank()) {
            Optional<Batch> bOpt = batchRepository.findById(requestedBatchId);
            if (bOpt.isPresent()) return bOpt.get();
        }

        // 2. Find trainer's assigned batch
        Batch assignedBatch = null;
        if (u != null) {
            List<Batch> techBatches = batchRepository.findByTechnicalTrainer_Id(u.getId());
            if (!techBatches.isEmpty()) assignedBatch = techBatches.get(0);

            if (assignedBatch == null) {
                List<Batch> softBatches = batchRepository.findBySoftSkillsTrainer_Id(u.getId());
                if (!softBatches.isEmpty()) assignedBatch = softBatches.get(0);
            }
        }

        if (assignedBatch == null && trainerEmail != null && !trainerEmail.isBlank()) {
            Trainer t = trainerRepository.findByEmail(trainerEmail).orElse(null);
            if (t != null && t.getBatchId() != null && !t.getBatchId().isBlank()) {
                assignedBatch = batchRepository.findById(t.getBatchId()).orElse(null);
            }
        }

        // 3. If requestedBatchId is provided, verify it matches trainer's assigned batch (unless admin)
        if (requestedBatchId != null && !requestedBatchId.isBlank()) {
            if (!isAdmin && assignedBatch != null) {
                boolean matchesId = requestedBatchId.equalsIgnoreCase(assignedBatch.getId());
                boolean matchesName = assignedBatch.getBatchName() != null && requestedBatchId.equalsIgnoreCase(assignedBatch.getBatchName());
                if (!matchesId && !matchesName) {
                    throw new AccessDeniedException("You are not authorized to access materials for batch: " + requestedBatchId);
                }
            } else if (assignedBatch == null) {
                Optional<Batch> reqBatchOpt = batchRepository.findById(requestedBatchId);
                if (reqBatchOpt.isPresent()) return reqBatchOpt.get();
            }
        }

        if (assignedBatch != null) {
            return assignedBatch;
        }

        List<Batch> allBatches = batchRepository.findAll();
        return allBatches.isEmpty() ? null : allBatches.get(0);
    }

    private String normalizeMaterialType(String type, String fileName) {
        if (type != null && !type.isBlank()) {
            String t = type.trim().toUpperCase();
            if (t.contains("IMAGE") || t.contains("PNG") || t.contains("JPG") || t.contains("JPEG") || t.contains("PICTURE")) {
                return "IMAGE";
            }
            if (t.contains("PDF")) {
                return "PDF";
            }
            if (t.contains("WORD") || t.contains("DOC")) {
                return "DOC";
            }
            if (t.contains("POWERPOINT") || t.contains("PPT") || t.contains("PRESENTATION")) {
                return "PPT";
            }
            if (t.contains("VIDEO")) {
                return "VIDEO";
            }
            return t;
        }
        if (fileName != null && fileName.contains(".")) {
            String ext = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
            return detectMaterialType(ext);
        }
        return "PDF";
    }

    private String detectMaterialType(String extension) {
        if (extension == null) return "PDF";
        return switch (extension.toLowerCase()) {
            case "png", "jpg", "jpeg", "gif", "webp" -> "IMAGE";
            case "doc", "docx", "txt" -> "DOC";
            case "ppt", "pptx" -> "PPT";
            case "mp4", "mkv", "avi" -> "VIDEO";
            default -> "PDF";
        };
    }
}