package com.example.backend.dto.admin;

import com.example.backend.entity.LegendCategory;
import com.example.backend.entity.Region;

import java.time.LocalDateTime;

public record AdminLegendListItemResponse(
        Long id,
        String title,
        Region region,
        String city,
        LegendCategory category,
        String imageUrl,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        Long authorId,
        String authorUsername
) {
}