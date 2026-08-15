package com.example.SPT.util;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

public class FileUploadUtil {

    private static final String UPLOAD_DIR = "uploads/";

    private FileUploadUtil() {
    }

    public static String uploadFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String safeName = (originalFilename != null && !originalFilename.isBlank())
                ? UUID.randomUUID().toString().substring(0, 8) + "_" + originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_")
                : "file_" + System.currentTimeMillis();

        Path filePath = uploadPath.resolve(safeName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + safeName;
    }
}