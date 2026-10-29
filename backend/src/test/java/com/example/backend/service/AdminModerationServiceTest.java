package com.example.backend.service;

import com.example.backend.dto.admin.DismissLegendReportRequest;
import com.example.backend.dto.admin.LegendModerationItemResponse;
import com.example.backend.dto.admin.ModerationDecisionRequest;
import com.example.backend.dto.admin.RejectLegendRequest;
import com.example.backend.entity.*;
import com.example.backend.exception.AdminOperationNotAllowedException;
import com.example.backend.repository.LegendReportRepository;
import com.example.backend.repository.LegendRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminModerationServiceTest {

    @Mock
    private LegendRepository legendRepository;

    @Mock
    private LegendReportRepository reportRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AdminAuditService auditService;

    @InjectMocks
    private AdminModerationService moderationService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void approvesPendingLegendAndRecordsAudit() {
        UUID id = UUID.randomUUID();
        Legend legend = Legend.builder()
                .id(id)
                .title("Lech, Czech i Rus")
                .status(LegendStatus.PENDING)
                .build();
        authenticateAdmin();
        when(legendRepository.findById(id)).thenReturn(Optional.of(legend));
        when(legendRepository.save(legend)).thenReturn(legend);

        LegendModerationItemResponse result = moderationService.approve(
                id, new ModerationDecisionRequest("Dobra jakość")
        );

        assertThat(result.status()).isEqualTo(LegendStatus.PUBLISHED);
        assertThat(result.moderationNotes()).isEqualTo("Dobra jakość");
        verify(auditService).record(
                AdminAuditAction.LEGEND_APPROVED,
                AdminAuditTargetType.LEGEND,
                id,
                "Lech, Czech i Rus",
                "Legenda została zatwierdzona. Notatki: Dobra jakość"
        );
    }

    @Test
    void rejectsPendingLegendWithReason() {
        UUID id = UUID.randomUUID();
        Legend legend = Legend.builder()
                .id(id)
                .title("Test")
                .status(LegendStatus.PENDING)
                .build();
        authenticateAdmin();
        when(legendRepository.findById(id)).thenReturn(Optional.of(legend));
        when(legendRepository.save(legend)).thenReturn(legend);

        LegendModerationItemResponse result = moderationService.reject(
                id, new RejectLegendRequest("  Za krótka treść  ", "Popraw opis")
        );

        assertThat(result.status()).isEqualTo(LegendStatus.REJECTED);
        assertThat(result.rejectionReason()).isEqualTo("Za krótka treść");
    }

    @Test
    void preventsApprovingAlreadyPublishedLegend() {
        UUID id = UUID.randomUUID();
        Legend published = Legend.builder()
                .id(id)
                .status(LegendStatus.PUBLISHED)
                .build();
        when(legendRepository.findById(id)).thenReturn(Optional.of(published));

        assertThatThrownBy(() -> moderationService.approve(id, new ModerationDecisionRequest(null)))
                .isInstanceOf(AdminOperationNotAllowedException.class);
    }

    @Test
    void dismissesOpenReportAndRecordsAudit() {
        UUID reportId = UUID.randomUUID();
        Legend legend = Legend.builder().id(UUID.randomUUID()).title("Wawel").build();
        LegendReport report = LegendReport.builder()
                .id(reportId)
                .legend(legend)
                .status(LegendReportStatus.OPEN)
                .build();
        authenticateAdmin();
        when(reportRepository.findById(reportId)).thenReturn(Optional.of(report));

        moderationService.dismissReport(reportId, new DismissLegendReportRequest("Fałszywy alarm"));

        assertThat(report.getStatus()).isEqualTo(LegendReportStatus.DISMISSED);
        assertThat(report.getModerationNotes()).isEqualTo("Fałszywy alarm");
        verify(reportRepository).save(report);
    }

    private void authenticateAdmin() {
        User admin = User.builder()
                .id(UUID.randomUUID())
                .username("admin")
                .role(Role.ADMIN)
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin", null, List.of())
        );
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(admin));
    }
}
