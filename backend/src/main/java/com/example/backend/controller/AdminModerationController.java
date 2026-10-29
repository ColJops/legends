package com.example.backend.controller;

import com.example.backend.dto.PagedResponse;
import com.example.backend.dto.admin.*;
import com.example.backend.service.AdminModerationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Validated
@RestController
@RequestMapping("/api/admin/moderation")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminModerationController {

    private final AdminModerationService moderationService;

    @GetMapping("/summary")
    public ModerationSummaryResponse summary() {
        return moderationService.getSummary();
    }

    @GetMapping("/queue")
    public PagedResponse<LegendModerationItemResponse> queue(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size
    ) {
        return moderationService.getQueue(page, size);
    }

    @PostMapping("/queue/{id}/approve")
    public LegendModerationItemResponse approve(
            @PathVariable UUID id,
            @Valid @RequestBody ModerationDecisionRequest request
    ) {
        return moderationService.approve(id, request);
    }

    @PostMapping("/queue/{id}/reject")
    public LegendModerationItemResponse reject(
            @PathVariable UUID id,
            @Valid @RequestBody RejectLegendRequest request
    ) {
        return moderationService.reject(id, request);
    }

    @PostMapping("/legends/{id}/archive")
    public LegendModerationItemResponse archive(
            @PathVariable UUID id,
            @Valid @RequestBody ModerationDecisionRequest request
    ) {
        return moderationService.archive(id, request);
    }

    @GetMapping("/reports")
    public PagedResponse<LegendReportQueueItemResponse> reports(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size
    ) {
        return moderationService.getReports(page, size);
    }

    @PostMapping("/reports/{id}/dismiss")
    public void dismissReport(
            @PathVariable UUID id,
            @Valid @RequestBody DismissLegendReportRequest request
    ) {
        moderationService.dismissReport(id, request);
    }
}
