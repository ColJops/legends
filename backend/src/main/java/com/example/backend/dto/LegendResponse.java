package com.example.backend.dto;

import com.example.backend.entity.LegendCategory;
import com.example.backend.entity.Region;

import java.time.LocalDateTime;

public record LegendResponse(
        Long id,
        String title,
        String content,
        Region region,
        String city,
        LegendCategory category,
        String imageUrl,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}