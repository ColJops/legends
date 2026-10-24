package com.example.backend.dto.admin;

import com.example.backend.entity.LegendCategory;
import com.example.backend.entity.Region;

import java.time.LocalDateTime;
import java.util.UUID;

public record AdminLegendSummaryResponse(
        UUID id,
        String title,
        Region region,
        LegendCategory category,
        String authorUsername,
        LocalDateTime createdAt
) {
}