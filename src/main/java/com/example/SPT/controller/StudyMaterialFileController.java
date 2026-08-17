package com.example.SPT.controller;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import com.example.SPT.entity.Batch;
import com.example.SPT.entity.Student;
import com.example.SPT.entity.StudyMaterial;
import com.example.SPT.entity.Trainer;
import com.example.SPT.entity.User;
import com.example.SPT.repository.BatchRepository;
import com.example.SPT.repository.StudentRepository;
import com.example.SPT.repository.StudyMaterialRepository;
import com.example.SPT.repository.TrainerRepository;
import com.example.SPT.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Slf4j
@CrossOrigin("*")
public class StudyMaterialFileController {

    private final StudyMaterialRepository studyMaterialRepository;
    private final StudentRepository studentRepository;
    private final TrainerRepository trainerRepository;
    private final UserRepository userRepository;
    private final BatchRepository batchRepository;

    @GetMapping({
            "/api/materials/{id}/file", "/api/materials/{id}/view", "/api/materials/{id}/download",
            "/api/trainer/materials/{id}/file", "/api/trainer/materials/{id}/view", "/api/trainer/materials/{id}/download",
            "/api/student/materials/{id}/file", "/api/student/materials/{id}/view", "/api/student/materials/{id}/download"
    })
    public ResponseEntity<?> getMaterialFile(
            @PathVariable("id") String id,
            @RequestParam(value = "mode", required = false) String mode,
            jakarta.servlet.http.HttpServletRequest request,
            Authentication authentication) {

        try {
            String uri = request != null ? request.getRequestURI() : "";
            boolean isDownloadMode = (mode != null && "download".equalsIgnoreCase(mode.trim())) || uri.endsWith("/download");

            log.info("Request for study material file ID: {}, mode: {}, isDownload: {}", id, mode, isDownloadMode);

            if (id == null || id.isBlank()) {
                Map<String, String> err = new HashMap<>();
                err.put("message", "Invalid material ID.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
            }

            Optional<StudyMaterial> materialOpt = studyMaterialRepository.findById(id);
            if (materialOpt.isEmpty()) {
                Map<String, String> err = new HashMap<>();
                err.put("message", "Material file not found.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
            }

            StudyMaterial material = materialOpt.get();

            // Security & Batch Authorization Check
            if (authentication != null && authentication.getName() != null) {
                String username = authentication.getName();
                if (!isUserAuthorizedForMaterial(username, material)) {
                    log.warn("User '{}' unauthorized to access material ID '{}' of batch '{}'", username, id, material.getBatchId());
                    Map<String, String> err = new HashMap<>();
                    err.put("message", "You are not authorized to access this material.");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
                }
            }

            // If fileUrl is an external link (e.g. AWS S3), redirect directly
            String fileUrl = material.getFileUrl();
            if (fileUrl != null && (fileUrl.startsWith("http://") || fileUrl.startsWith("https://"))) {
                try {
                    return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(fileUrl)).build();
                } catch (Exception e) {
                    log.warn("Failed to redirect to external material URL: {}", fileUrl);
                }
            }

            // File Path Resolution on disk
            String targetFileName = resolveTargetFileName(material);
            if (targetFileName == null || targetFileName.trim().isEmpty()) {
                Map<String, String> err = new HashMap<>();
                err.put("message", "Material file not found.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
            }

            Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
            Path filePath = uploadDir.resolve(targetFileName).normalize();

            // Path Traversal Security Verification
            if (!filePath.startsWith(uploadDir)) {
                log.warn("Path traversal attempt detected for file: {}", targetFileName);
                Map<String, String> err = new HashMap<>();
                err.put("message", "You are not authorized to access this material.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
            }

            File physicalFile = filePath.toFile();
            if (!physicalFile.exists() || !physicalFile.canRead()) {
                // Attempt fallback matching in uploads/ folder if unique prefix was added
                File fallback = findFallbackFile(uploadDir, targetFileName, material.getFileName());
                if (fallback != null && fallback.exists() && fallback.canRead()) {
                    physicalFile = fallback;
                } else {
                    log.error("Physical file does not exist on disk: {}", filePath);
                    Map<String, String> err = new HashMap<>();
                    err.put("message", "Material file not found on disk.");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
                }
            }

            Resource resource = new FileSystemResource(physicalFile);
            MediaType mediaType = determineMediaType(physicalFile.getName());
            String originalName = material.getFileName() != null ? material.getFileName() : physicalFile.getName();

            String dispositionType = (isDownloadMode || !isInlineViewable(mediaType)) ? "attachment" : "inline";

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, dispositionType + "; filename=\"" + originalName.replaceAll("\"", "_") + "\"")
                    .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION)
                    .body(resource);
        } catch (Exception ex) {
            log.error("Error serving study material file {}: {}", id, ex.getMessage(), ex);
            Map<String, String> err = new HashMap<>();
            err.put("message", "Unable to load material file: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    private boolean isUserAuthorizedForMaterial(String username, StudyMaterial material) {
        String materialBatchId = material.getBatchId();
        if (materialBatchId == null || materialBatchId.isBlank()) return true;

        // 1. Check if user is Student
        Optional<Student> studentOpt = studentRepository.findByEmail(username);
        if (studentOpt.isEmpty()) {
            studentOpt = studentRepository.findById(username);
        }

        if (studentOpt.isPresent()) {
            Student s = studentOpt.get();
            if (materialBatchId.equalsIgnoreCase(s.getBatchId())) return true;
            // Check batch name matching
            Optional<Batch> bOpt = batchRepository.findById(s.getBatchId() != null ? s.getBatchId() : "");
            if (bOpt.isPresent() && bOpt.get().getBatchName() != null && bOpt.get().getBatchName().equalsIgnoreCase(materialBatchId)) {
                return true;
            }
            return false;
        }

        // 2. Check if user is Trainer / Admin
        Optional<Trainer> trainerOpt = trainerRepository.findByEmail(username);
        if (trainerOpt.isPresent()) {
            Trainer t = trainerOpt.get();
            if (t.getId() != null && t.getId().equalsIgnoreCase(material.getTrainerId())) return true;
            if (t.getBatchId() != null && t.getBatchId().equalsIgnoreCase(materialBatchId)) return true;
        }

        Optional<User> userOpt = userRepository.findByEmail(username);
        if (userOpt.isPresent()) {
            User u = userOpt.get();
            String roleName = u.getRole() != null ? u.getRole().name() : "";
            if (roleName.contains("ADMIN") || u.getRole() == com.example.SPT.enums.Role.ADMIN) return true;

            List<Batch> techBatches = batchRepository.findByTechnicalTrainer_Id(u.getId());
            if (techBatches.stream().anyMatch(b -> b.getId().equalsIgnoreCase(materialBatchId))) return true;

            List<Batch> softBatches = batchRepository.findBySoftSkillsTrainer_Id(u.getId());
            if (softBatches.stream().anyMatch(b -> b.getId().equalsIgnoreCase(materialBatchId))) return true;
        }

        // Fallback: Default single-batch environment permission
        return true;
    }

    private String resolveTargetFileName(StudyMaterial material) {
        String url = material.getFileUrl();
        if (url != null && !url.isBlank()) {
            if (url.startsWith("/uploads/")) {
                return url.substring("/uploads/".length());
            }
            if (url.startsWith("uploads/")) {
                return url.substring("uploads/".length());
            }
            if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("/api/")) {
                return url;
            }
        }
        return material.getFileName();
    }

    private File findFallbackFile(Path uploadDir, String targetFileName, String rawFileName) {
        File[] files = uploadDir.toFile().listFiles();
        if (files == null) return null;

        for (File f : files) {
            if (f.getName().equalsIgnoreCase(targetFileName)) return f;
            if (rawFileName != null && f.getName().toLowerCase().endsWith(rawFileName.toLowerCase())) return f;
        }
        return null;
    }

    private MediaType determineMediaType(String fileName) {
        String name = fileName.toLowerCase();
        if (name.endsWith(".pdf")) return MediaType.APPLICATION_PDF;
        if (name.endsWith(".pptx")) return MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.presentationml.presentation");
        if (name.endsWith(".ppt")) return MediaType.parseMediaType("application/vnd.ms-powerpoint");
        if (name.endsWith(".docx")) return MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        if (name.endsWith(".doc")) return MediaType.parseMediaType("application/msword");
        if (name.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return MediaType.IMAGE_JPEG;
        if (name.endsWith(".txt")) return MediaType.TEXT_PLAIN;
        if (name.endsWith(".zip")) return MediaType.parseMediaType("application/zip");
        return MediaType.APPLICATION_OCTET_STREAM;
    }

    private boolean isInlineViewable(MediaType mediaType) {
        return mediaType.equals(MediaType.APPLICATION_PDF) ||
               mediaType.equals(MediaType.IMAGE_PNG) ||
               mediaType.equals(MediaType.IMAGE_JPEG) ||
               mediaType.equals(MediaType.TEXT_PLAIN);
    }
}
