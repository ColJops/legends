package com.example.backend.dto.admin;

import java.util.List;

public record AdminDashboardResponse(
        long legendsCount,
        long usersCount,
        long legendsLast7DaysCount,
        long legendsLast30DaysCount,
        List<AdminLegendSummaryResponse> recentLegends,
        List<AdminUserSummaryResponse> recentUsers
) {
}