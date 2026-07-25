package com.example.backend.dto.admin;

import com.example.backend.entity.LegendCategory;
import com.example.backend.entity.Region;

import java.time.LocalDateTime;

public record AdminLegendSummaryResponse(
        Long id,
        String title,
        Region region,
        LegendCategory category,
        String authorUsername,
        LocalDateTime createdAt
) {
}