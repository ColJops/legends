package com.example.backend.controller;

import com.example.backend.dto.HomeStatsResponse;
import com.example.backend.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/home")
    public HomeStatsResponse getHomeStats() {
        return statsService.getHomeStats();
    }
}