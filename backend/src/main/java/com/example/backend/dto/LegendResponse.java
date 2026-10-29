package com.example.backend.dto;

import com.example.backend.entity.LegendCategory;
import com.example.backend.entity.LegendStatus;
import com.example.backend.entity.Region;

import java.time.LocalDateTime;
import java.util.UUID;

public record LegendResponse(
        UUID id,
        String title,
        String content,
        Region region,
        String city,
        LegendCategory category,
        String imageUrl,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        UUID authorId,
        String authorUsername,
        LegendStatus status,
        String rejectionReason
) {
}
