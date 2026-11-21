package com.example.backend.dto;

import java.util.Map;

public record RegionStatsResponse(
        long totalLegends,
        long citiesCount,
        Map<String, Long> byCategory
) {
}
