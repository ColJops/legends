package com.example.backend.dto;

import java.time.LocalDateTime;

public record LegendResponse(
        Long id,
        String title,
        String content,
        String region,
        String city,
        String category,
        String imageUrl,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
