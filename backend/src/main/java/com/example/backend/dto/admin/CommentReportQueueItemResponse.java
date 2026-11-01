package com.example.backend.dto.admin;

import com.example.backend.entity.LegendReportReason;

import java.time.LocalDateTime;
import java.util.UUID;

public record CommentReportQueueItemResponse(
        UUID id,
        UUID commentId,
        String commentContent,
        String commentAuthorUsername,
        UUID legendId,
        String legendTitle,
        String reporterUsername,
        LegendReportReason reason,
        String details,
        LocalDateTime createdAt
) {
}
