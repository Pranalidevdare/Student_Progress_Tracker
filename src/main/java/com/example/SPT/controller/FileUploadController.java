package com.example.SPT.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.SPT.util.FileUploadUtil;

@RestController
@RequestMapping({"/api/files", "/api/trainer/files", "/api/student/files"})
@CrossOrigin("*")
public class FileUploadController {

    private static final long MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "doc", "docx", "ppt", "pptx", "png", "jpg", "jpeg", "txt", "zip", "js", "java", "py", "html", "css"
    );

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "File is mandatory. Please select a file to upload.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "File size exceeds maximum limit of 25 MB.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Unsupported file format. Allowed formats: PDF, DOC, DOCX, PPT, PPTX, PNG, JPG, ZIP, TXT.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        try {
            String fileUrl = FileUploadUtil.uploadFile(file);

            String materialType = switch (extension) {
                case "pdf" -> "PDF";
                case "doc", "docx" -> "DOC";
                case "ppt", "pptx" -> "PPT";
                case "png", "jpg", "jpeg" -> "IMAGE";
                default -> "PDF";
            };

            Map<String, Object> resp = new HashMap<>();
            resp.put("fileUrl", fileUrl);
            resp.put("fileName", originalName);
            resp.put("fileSize", file.getSize());
            resp.put("materialType", materialType);
            resp.put("message", "File uploaded successfully.");

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Failed to store file on server: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }
}
