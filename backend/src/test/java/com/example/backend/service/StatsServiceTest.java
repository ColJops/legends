package com.example.backend.service;

import com.example.backend.dto.HomeStatsResponse;
import com.example.backend.entity.LegendStatus;
import com.example.backend.entity.Region;
import com.example.backend.repository.LegendRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StatsServiceTest {

    @Mock
    private LegendRepository legendRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private StatsService statsService;

    @Test
    void returnsPublishedLegendsRegionsAndUsersCount() {
        when(legendRepository.countByStatus(LegendStatus.PUBLISHED)).thenReturn(25L);
        when(userRepository.count()).thenReturn(12L);

        HomeStatsResponse response = statsService.getHomeStats();

        assertThat(response.legendsCount()).isEqualTo(25L);
        assertThat(response.regionsCount()).isEqualTo(Region.values().length);
        assertThat(response.usersCount()).isEqualTo(12L);
    }
}
