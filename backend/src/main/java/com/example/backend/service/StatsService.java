package com.example.backend.service;

import com.example.backend.dto.HomeStatsResponse;
import com.example.backend.entity.Region;
import com.example.backend.repository.LegendRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final LegendRepository legendRepository;
    private final UserRepository userRepository;

    public HomeStatsResponse getHomeStats() {
        return new HomeStatsResponse(
                legendRepository.count(),
                Region.values().length,
                userRepository.count()
        );
    }
}