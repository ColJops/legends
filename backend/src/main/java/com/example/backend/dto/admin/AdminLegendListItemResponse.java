package com.example.backend.dto.admin;

import com.example.backend.entity.LegendCategory;
import com.example.backend.entity.Region;

import java.time.LocalDateTime;
import java.util.UUID;

public record AdminLegendListItemResponse(
        UUID id,
        String title,
        Region region,
        String city,
        LegendCategory category,
        String imageUrl,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        UUID authorId,
        String authorUsername
) {
}