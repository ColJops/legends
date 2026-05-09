package com.example.backend.upload;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UploadController {

    private final FileUploadService fileUploadService;

    @PostMapping("/legend-image")
    public Map<String, String> uploadLegendImage(@RequestParam("file") MultipartFile file) {
        String imageUrl = fileUploadService.uploadLegendImage(file);

        return Map.of("imageUrl", imageUrl);
    }
}