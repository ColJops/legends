package com.example.backend.dto.admin;

import com.example.backend.entity.LegendReportReason;

import java.time.LocalDateTime;
import java.util.UUID;

public record LegendReportQueueItemResponse(
        UUID id,
        UUID legendId,
        String legendTitle,
        String legendContent,
        String imageUrl,
        String authorUsername,
        String reporterUsername,
        LegendReportReason reason,
        String details,
        LocalDateTime createdAt
) {
}
