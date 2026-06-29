package com.example.backend.dto;

public record HomeStatsResponse(
        long legendsCount,
        int regionsCount,
        long usersCount
) {
}