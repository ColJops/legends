package com.example.backend.service;

import com.example.backend.dto.PagedResponse;
import com.example.backend.dto.admin.DismissLegendReportRequest;
import com.example.backend.dto.admin.LegendModerationItemResponse;
import com.example.backend.dto.admin.LegendReportQueueItemResponse;
import com.example.backend.dto.admin.ModerationSummaryResponse;
import com.example.backend.dto.admin.ModerationDecisionRequest;
import com.example.backend.dto.admin.RejectLegendRequest;
import com.example.backend.entity.*;
import com.example.backend.exception.AdminOperationNotAllowedException;
import com.example.backend.exception.LegendNotFoundException;
import com.example.backend.repository.LegendReportRepository;
import com.example.backend.repository.LegendRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.specification.LegendSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminModerationService {

    private final LegendRepository legendRepository;
    private final LegendReportRepository reportRepository;
    private final UserRepository userRepository;
    private final AdminAuditService auditService;

    @Transactional(readOnly = true)
    public ModerationSummaryResponse getSummary() {
        return new ModerationSummaryResponse(
                legendRepository.countByStatus(LegendStatus.PENDING),
                reportRepository.countByStatus(LegendReportStatus.OPEN),
                userRepository.countByCreatedAtGreaterThanEqual(LocalDateTime.now().minusDays(7))
        );
    }

    @Transactional(readOnly = true)
    public PagedResponse<LegendModerationItemResponse> getQueue(int page, int size) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.clamp(size, 1, 50),
                Sort.by(Sort.Direction.ASC, "createdAt")
        );
        Page<LegendModerationItemResponse> result = legendRepository.findAll(
                        LegendSpecification.hasStatus(LegendStatus.PENDING),
                        pageable
                )
                .map(this::toModerationItem);

        return toPagedResponse(result);
    }

    @Transactional(readOnly = true)
    public PagedResponse<LegendReportQueueItemResponse> getReports(int page, int size) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.clamp(size, 1, 50),
                Sort.by(Sort.Direction.ASC, "createdAt")
        );
        Page<LegendReportQueueItemResponse> result = reportRepository
                .findAllByStatus(LegendReportStatus.OPEN, pageable)
                .map(this::toReportItem);

        return toPagedResponse(result);
    }

    @Transactional
    public LegendModerationItemResponse approve(UUID id, ModerationDecisionRequest request) {
        Legend legend = requirePendingLegend(id);
        legend.setStatus(LegendStatus.PUBLISHED);
        applyModerator(legend, request.moderationNotes());
        Legend saved = legendRepository.save(legend);
        auditService.record(
                AdminAuditAction.LEGEND_APPROVED,
                AdminAuditTargetType.LEGEND,
                saved.getId(),
                saved.getTitle(),
                auditDetails("Legenda została zatwierdzona", request.moderationNotes())
        );
        return toModerationItem(saved);
    }

    @Transactional
    public LegendModerationItemResponse reject(UUID id, RejectLegendRequest request) {
        Legend legend = requirePendingLegend(id);
        legend.setStatus(LegendStatus.REJECTED);
        legend.setRejectionReason(request.rejectionReason().trim());
        applyModerator(legend, request.moderationNotes());
        Legend saved = legendRepository.save(legend);
        auditService.record(
                AdminAuditAction.LEGEND_REJECTED,
                AdminAuditTargetType.LEGEND,
                saved.getId(),
                saved.getTitle(),
                auditDetails("Powód: " + saved.getRejectionReason(), request.moderationNotes())
        );
        return toModerationItem(saved);
    }

    @Transactional
    public LegendModerationItemResponse archive(UUID id, ModerationDecisionRequest request) {
        Legend legend = legendRepository.findById(id)
                .orElseThrow(() -> new LegendNotFoundException(id));
        if (legend.getStatus() == LegendStatus.ARCHIVED
                || legend.getStatus() == LegendStatus.DRAFT) {
            throw new AdminOperationNotAllowedException(
                    "Szkic lub zarchiwizowana legenda nie może zostać ponownie zarchiwizowana"
            );
        }
        legend.setStatus(LegendStatus.ARCHIVED);
        legend.setRejectionReason(null);
        applyModerator(legend, request.moderationNotes());
        Legend saved = legendRepository.save(legend);
        auditService.record(
                AdminAuditAction.LEGEND_ARCHIVED,
                AdminAuditTargetType.LEGEND,
                saved.getId(),
                saved.getTitle(),
                auditDetails("Legenda została zarchiwizowana", request.moderationNotes())
        );
        return toModerationItem(saved);
    }

    @Transactional
    public void dismissReport(UUID id, DismissLegendReportRequest request) {
        LegendReport report = reportRepository.findById(id)
                .orElseThrow(() -> new AdminOperationNotAllowedException(
                        "Nie znaleziono zgłoszenia"
                ));
        if (report.getStatus() != LegendReportStatus.OPEN) {
            throw new AdminOperationNotAllowedException(
                    "Zgłoszenie zostało już rozpatrzone"
            );
        }

        User moderator = getCurrentModerator();
        report.setStatus(LegendReportStatus.DISMISSED);
        report.setModerationNotes(trim(request.moderationNotes()));
        report.setResolvedAt(LocalDateTime.now());
        report.setResolvedBy(moderator);
        reportRepository.save(report);

        auditService.record(
                AdminAuditAction.LEGEND_REPORT_DISMISSED,
                AdminAuditTargetType.REPORT,
                report.getId(),
                report.getLegend().getTitle(),
                auditDetails("Zgłoszenie zamknięto bez działań", request.moderationNotes())
        );
    }

    private Legend requirePendingLegend(UUID id) {
        Legend legend = legendRepository.findById(id)
                .orElseThrow(() -> new LegendNotFoundException(id));
        if (legend.getStatus() != LegendStatus.PENDING) {
            throw new AdminOperationNotAllowedException(
                    "Można rozpatrywać wyłącznie legendy oczekujące na moderację"
            );
        }
        return legend;
    }

    private void applyModerator(Legend legend, String notes) {
        legend.setModerationNotes(trim(notes));
        legend.setModeratedAt(LocalDateTime.now());
        legend.setModeratedBy(getCurrentModerator());
    }

    private User getCurrentModerator() {
        String username = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        User moderator = userRepository.findByUsername(username)
                .orElseThrow(() -> new AdminOperationNotAllowedException(
                        "Nie znaleziono administratora wykonującego operację"
                ));
        if (moderator.getRole() != Role.ADMIN) {
            throw new AdminOperationNotAllowedException(
                    "Operację może wykonać wyłącznie administrator"
            );
        }
        return moderator;
    }

    private LegendModerationItemResponse toModerationItem(Legend legend) {
        return new LegendModerationItemResponse(
                legend.getId(), legend.getTitle(), legend.getContent(),
                legend.getRegion(), legend.getCity(), legend.getCategory(),
                legend.getImageUrl(), legend.getCreatedAt(),
                legend.getAuthor() == null ? null : legend.getAuthor().getId(),
                legend.getAuthor() == null ? null : legend.getAuthor().getUsername(),
                legend.getStatus(), legend.getRejectionReason(), legend.getModerationNotes()
        );
    }

    private LegendReportQueueItemResponse toReportItem(LegendReport report) {
        Legend legend = report.getLegend();
        return new LegendReportQueueItemResponse(
                report.getId(), legend.getId(), legend.getTitle(), legend.getContent(), legend.getImageUrl(),
                legend.getAuthor() == null ? null : legend.getAuthor().getUsername(),
                report.getReporterUsername(), report.getReason(),
                report.getDetails(), report.getCreatedAt()
        );
    }

    private <T> PagedResponse<T> toPagedResponse(Page<T> page) {
        return new PagedResponse<>(
                page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(),
                page.isFirst(), page.isLast()
        );
    }

    private String auditDetails(String action, String notes) {
        String trimmedNotes = trim(notes);
        return trimmedNotes == null ? action : action + ". Notatki: " + trimmedNotes;
    }

    private String trim(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
