package com.example.backend.service;

import com.example.backend.dto.LegendReportRequest;
import com.example.backend.entity.*;
import com.example.backend.exception.LegendAccessDeniedException;
import com.example.backend.exception.LegendNotFoundException;
import com.example.backend.repository.LegendReportRepository;
import com.example.backend.repository.LegendRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LegendReportService {

    private final LegendRepository legendRepository;
    private final LegendReportRepository reportRepository;
    private final UserRepository userRepository;

    @Transactional
    public void report(UUID legendId, LegendReportRequest request) {
        Legend legend = legendRepository.findById(legendId)
                .filter(item -> item.getStatus() == LegendStatus.PUBLISHED)
                .orElseThrow(() -> new LegendNotFoundException(legendId));
        User reporter = getCurrentUser();

        if (legend.getAuthor() != null
                && legend.getAuthor().getId().equals(reporter.getId())) {
            throw new LegendAccessDeniedException();
        }

        if (reportRepository.existsByLegend_IdAndReporter_IdAndStatus(
                legendId,
                reporter.getId(),
                LegendReportStatus.OPEN
        )) {
            return;
        }

        LegendReport report = LegendReport.builder()
                .legend(legend)
                .reporter(reporter)
                .reporterUsername(reporter.getUsername())
                .reason(request.reason())
                .details(trim(request.details()))
                .build();

        reportRepository.save(report);
    }

    private User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User is not authenticated");
        }

        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }

    private String trim(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
