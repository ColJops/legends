package com.example.backend.dto.community;

public record RatingSummaryResponse(
        double averageRating,
        long ratingsCount,
        Integer userRating
) {}
