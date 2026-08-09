package com.example.SPT.util;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

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

        String fileName = file.getOriginalFilename();

        Path filePath = uploadPath.resolve(fileName);

        Files.copy(file.getInputStream(), filePath);

        return filePath.toString();

    }

}