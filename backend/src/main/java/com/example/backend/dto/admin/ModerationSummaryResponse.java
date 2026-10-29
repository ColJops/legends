package com.example.backend.dto.admin;

public record ModerationSummaryResponse(
        long pendingLegends,
        long openReports,
        long newUsersLast7Days
) {
}
