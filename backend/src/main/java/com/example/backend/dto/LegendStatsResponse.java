package com.example.backend.dto;

import java.util.Map;

public record LegendStatsResponse(

        Long totalLegends,
        Map<String, Long> byCategory,
        Map<String, Long> byRegion
) {
}
