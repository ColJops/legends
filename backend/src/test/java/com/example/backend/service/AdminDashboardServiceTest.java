package com.example.backend.service;

import com.example.backend.dto.admin.AdminDashboardResponse;
import com.example.backend.entity.*;
import com.example.backend.repository.LegendReportRepository;
import com.example.backend.repository.LegendRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminDashboardServiceTest {

    @Mock
    private LegendRepository legendRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LegendReportRepository reportRepository;

    @InjectMocks
    private AdminDashboardService dashboardService;

    @Test
    void aggregatesCountsAndRecentItemsForDashboard() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .username("maravoss")
                .email("mara@example.com")
                .role(Role.USER)
                .createdAt(LocalDateTime.now())
                .build();
        Legend legend = Legend.builder()
                .id(UUID.randomUUID())
                .title("Złota Kaczka")
                .region(Region.MAZOWIECKIE)
                .category(LegendCategory.LEGENDA)
                .author(user)
                .createdAt(LocalDateTime.now())
                .build();

        when(legendRepository.count()).thenReturn(100L);
        when(userRepository.count()).thenReturn(20L);
        when(legendRepository.countByCreatedAtGreaterThanEqual(any())).thenReturn(5L, 15L);
        when(legendRepository.findTop5ByOrderByCreatedAtDesc()).thenReturn(List.of(legend));
        when(userRepository.findTop5ByOrderByCreatedAtDesc()).thenReturn(List.of(user));
        when(legendRepository.countByStatus(LegendStatus.PENDING)).thenReturn(3L);
        when(reportRepository.countByStatus(LegendReportStatus.OPEN)).thenReturn(2L);
        when(userRepository.countByCreatedAtGreaterThanEqual(any())).thenReturn(4L);

        AdminDashboardResponse response = dashboardService.getDashboard();

        assertThat(response.legendsCount()).isEqualTo(100L);
        assertThat(response.usersCount()).isEqualTo(20L);
        assertThat(response.pendingLegendsCount()).isEqualTo(3L);
        assertThat(response.openReportsCount()).isEqualTo(2L);
        assertThat(response.newUsersLast7DaysCount()).isEqualTo(4L);
        assertThat(response.recentLegends()).hasSize(1);
        assertThat(response.recentLegends().getFirst().authorUsername()).isEqualTo("maravoss");
        assertThat(response.recentUsers()).hasSize(1);
    }
}
