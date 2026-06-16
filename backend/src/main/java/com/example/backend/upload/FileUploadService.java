package com.example.backend.upload;

import com.example.backend.exception.InvalidFileException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Stream;

@Service
public class FileUploadService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    @Value("${app.upload.dir}")
    private String uploadDir;

    public String uploadLegendImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("Plik jest pusty.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new InvalidFileException("Dozwolone są tylko pliki graficzne: JPG, PNG, WEBP lub GIF.");
        }

        try {
            byte[] bytes = file.getBytes();
            ImageType imageType = detectImageType(bytes);

            if (imageType == null || !imageType.contentType.equals(contentType.toLowerCase(Locale.ROOT))) {
                throw new InvalidFileException("Nieprawidłowy lub uszkodzony plik graficzny.");
            }

            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String filename = UUID.randomUUID() + imageType.extension;
            Path targetPath = uploadPath.resolve(filename).normalize();

            if (!targetPath.startsWith(uploadPath)) {
                throw new InvalidFileException("Nieprawidłowa ścieżka pliku.");
            }

            Files.write(targetPath, bytes, StandardOpenOption.CREATE_NEW);

            return "/uploads/legends/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Could not upload file", e);
        }
    }

    public void deleteLegendImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }

        String filename = extractFilename(imageUrl);

        if (filename.isBlank()) {
            return;
        }

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path targetPath = uploadPath.resolve(filename).normalize();

        if (!targetPath.startsWith(uploadPath)) {
            return;
        }

        try {
            boolean deleted = Files.deleteIfExists(targetPath);

            if (!deleted) {
                System.out.println("Image file not found: " + targetPath);
            }
        } catch (IOException e) {
            System.out.println("Could not delete image file: " + targetPath);
        }
    }

    private String extractFilename(String imageUrl) {
        int lastSlashIndex = imageUrl.lastIndexOf('/');

        if (lastSlashIndex == -1) {
            return imageUrl;
        }

        return imageUrl.substring(lastSlashIndex + 1);
    }

    public int cleanupOrphanedLegendImages(List<String> usedImageUrls) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

        if (!Files.exists(uploadPath)) {
            return 0;
        }

        Set<String> usedFilenames = new HashSet<>();

        for (String imageUrl : usedImageUrls) {
            String filename = extractFilename(imageUrl);

            if (!filename.isBlank()) {
                usedFilenames.add(filename);
            }
        }

        int deletedCount = 0;

        try (Stream<Path> files = Files.list(uploadPath)) {
            for (Path file : files.toList()) {
                if (!Files.isRegularFile(file)) {
                    continue;
                }

                String filename = file.getFileName().toString();

                if (!usedFilenames.contains(filename)) {
                    Files.deleteIfExists(file);
                    deletedCount++;
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not cleanup orphaned files", e);
        }

        return deletedCount;
    }

    private ImageType detectImageType(byte[] bytes) {
        if (bytes.length >= 8
                && bytes[0] == (byte) 0x89
                && bytes[1] == 0x50
                && bytes[2] == 0x4E
                && bytes[3] == 0x47
                && bytes[4] == 0x0D
                && bytes[5] == 0x0A
                && bytes[6] == 0x1A
                && bytes[7] == 0x0A) {
            return new ImageType("image/png", ".png");
        }

        if (bytes.length >= 3
                && bytes[0] == (byte) 0xFF
                && bytes[1] == (byte) 0xD8
                && bytes[2] == (byte) 0xFF) {
            return new ImageType("image/jpeg", ".jpg");
        }

        if (bytes.length >= 12
                && bytes[0] == 'R'
                && bytes[1] == 'I'
                && bytes[2] == 'F'
                && bytes[3] == 'F'
                && bytes[8] == 'W'
                && bytes[9] == 'E'
                && bytes[10] == 'B'
                && bytes[11] == 'P') {
            return new ImageType("image/webp", ".webp");
        }

        if (bytes.length >= 6
                && bytes[0] == 'G'
                && bytes[1] == 'I'
                && bytes[2] == 'F'
                && bytes[3] == '8'
                && (bytes[4] == '7' || bytes[4] == '9')
                && bytes[5] == 'a') {
            return new ImageType("image/gif", ".gif");
        }

        return null;
    }

    private record ImageType(String contentType, String extension) {
    }
}
