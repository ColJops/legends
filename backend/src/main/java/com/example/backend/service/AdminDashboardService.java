package com.example.backend.service;

import com.example.backend.dto.admin.AdminDashboardResponse;
import com.example.backend.dto.admin.AdminLegendSummaryResponse;
import com.example.backend.dto.admin.AdminUserSummaryResponse;
import com.example.backend.entity.Legend;
import com.example.backend.entity.User;
import com.example.backend.repository.LegendRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final LegendRepository legendRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        LocalDateTime thirtyDaysAgo = now.minusDays(30);

        List<AdminLegendSummaryResponse> recentLegends =
                legendRepository.findTop5ByOrderByCreatedAtDesc()
                        .stream()
                        .map(this::mapLegend)
                        .toList();

        List<AdminUserSummaryResponse> recentUsers =
                userRepository.findTop5ByOrderByCreatedAtDesc()
                        .stream()
                        .map(this::mapUser)
                        .toList();

        return new AdminDashboardResponse(
                legendRepository.count(),
                userRepository.count(),
                legendRepository.countByCreatedAtGreaterThanEqual(
                        sevenDaysAgo
                ),
                legendRepository.countByCreatedAtGreaterThanEqual(
                        thirtyDaysAgo
                ),
                recentLegends,
                recentUsers
        );
    }

    private AdminLegendSummaryResponse mapLegend(Legend legend) {
        String authorUsername = legend.getAuthor() != null
                ? legend.getAuthor().getUsername()
                : null;

        return new AdminLegendSummaryResponse(
                legend.getId(),
                legend.getTitle(),
                legend.getRegion(),
                legend.getCategory(),
                authorUsername,
                legend.getCreatedAt()
        );
    }

    private AdminUserSummaryResponse mapUser(User user) {
        return new AdminUserSummaryResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}