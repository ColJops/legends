package com.example.backend.service;

import com.example.backend.dto.LegendReportRequest;
import com.example.backend.entity.*;
import com.example.backend.exception.LegendAccessDeniedException;
import com.example.backend.exception.LegendNotFoundException;
import com.example.backend.repository.LegendReportRepository;
import com.example.backend.repository.LegendRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LegendReportServiceTest {

    @Mock
    private LegendRepository legendRepository;

    @Mock
    private LegendReportRepository reportRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private LegendReportService legendReportService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void savesNewReportForPublishedLegendOwnedBySomeoneElse() {
        UUID legendId = UUID.randomUUID();
        User author = User.builder().id(UUID.randomUUID()).username("autor").build();
        User reporter = User.builder().id(UUID.randomUUID()).username("zglaszajacy").build();
        Legend legend = Legend.builder()
                .id(legendId)
                .title("Bazyliszek")
                .status(LegendStatus.PUBLISHED)
                .author(author)
                .build();

        authenticate("zglaszajacy", reporter);
        when(legendRepository.findById(legendId)).thenReturn(Optional.of(legend));
        when(reportRepository.existsByLegend_IdAndReporter_IdAndStatus(
                legendId, reporter.getId(), LegendReportStatus.OPEN
        )).thenReturn(false);

        legendReportService.report(
                legendId,
                new LegendReportRequest(LegendReportReason.SPAM, "  Reklama  ")
        );

        ArgumentCaptor<LegendReport> captor = ArgumentCaptor.forClass(LegendReport.class);
        verify(reportRepository).save(captor.capture());
        LegendReport saved = captor.getValue();

        assertThat(saved.getLegend()).isSameAs(legend);
        assertThat(saved.getReporter()).isSameAs(reporter);
        assertThat(saved.getReporterUsername()).isEqualTo("zglaszajacy");
        assertThat(saved.getReason()).isEqualTo(LegendReportReason.SPAM);
        assertThat(saved.getDetails()).isEqualTo("Reklama");
    }

    @Test
    void ignoresDuplicateOpenReportFromSameUser() {
        UUID legendId = UUID.randomUUID();
        User reporter = User.builder().id(UUID.randomUUID()).username("zglaszajacy").build();
        Legend legend = Legend.builder()
                .id(legendId)
                .status(LegendStatus.PUBLISHED)
                .build();

        authenticate("zglaszajacy", reporter);
        when(legendRepository.findById(legendId)).thenReturn(Optional.of(legend));
        when(reportRepository.existsByLegend_IdAndReporter_IdAndStatus(
                legendId, reporter.getId(), LegendReportStatus.OPEN
        )).thenReturn(true);

        legendReportService.report(
                legendId,
                new LegendReportRequest(LegendReportReason.OTHER, null)
        );

        verify(reportRepository, never()).save(any());
    }

    @Test
    void forbidsAuthorFromReportingOwnLegend() {
        UUID legendId = UUID.randomUUID();
        User author = User.builder().id(UUID.randomUUID()).username("autor").build();
        Legend legend = Legend.builder()
                .id(legendId)
                .status(LegendStatus.PUBLISHED)
                .author(author)
                .build();

        authenticate("autor", author);
        when(legendRepository.findById(legendId)).thenReturn(Optional.of(legend));

        assertThatThrownBy(() -> legendReportService.report(
                legendId,
                new LegendReportRequest(LegendReportReason.SPAM, null)
        )).isInstanceOf(LegendAccessDeniedException.class);
    }

    @Test
    void throwsNotFoundWhenLegendIsNotPublished() {
        UUID legendId = UUID.randomUUID();
        Legend pendingLegend = Legend.builder()
                .id(legendId)
                .status(LegendStatus.PENDING)
                .build();
        when(legendRepository.findById(legendId)).thenReturn(Optional.of(pendingLegend));

        assertThatThrownBy(() -> legendReportService.report(
                legendId,
                new LegendReportRequest(LegendReportReason.SPAM, null)
        )).isInstanceOf(LegendNotFoundException.class);
    }

    private void authenticate(String username, User user) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(username, null, List.of())
        );
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
    }
}
