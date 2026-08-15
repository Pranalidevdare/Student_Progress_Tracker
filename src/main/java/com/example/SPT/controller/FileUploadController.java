package com.example.SPT.controller;

import java.util.Map;
import java.util.Set;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.SPT.util.FileUploadUtil;

@RestController
@RequestMapping({"/api/files", "/api/trainer/files", "/api/student/files"})
@CrossOrigin("*")
public class FileUploadController {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "doc", "docx", "zip", "png", "jpg", "jpeg", "txt", "js", "java", "py", "html", "css", "ppt", "pptx"
    );

    private static final long MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please select a file to upload."));
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body(Map.of("error", "File size exceeds 15MB limit."));
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null && originalFilename.contains(".")) {
            String ext = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
            if (!ALLOWED_EXTENSIONS.contains(ext)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "File extension '." + ext + "' is not supported. Allowed formats: PDF, DOC, DOCX, ZIP, PNG, JPG, TXT, JS, JAVA, PY."
                ));
            }
        }

        try {
            String fileUrl = FileUploadUtil.uploadFile(file);
            return ResponseEntity.ok(Map.of(
                    "fileUrl", fileUrl,
                    "fileName", originalFilename != null ? originalFilename : "file",
                    "fileSize", file.getSize()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }
}
