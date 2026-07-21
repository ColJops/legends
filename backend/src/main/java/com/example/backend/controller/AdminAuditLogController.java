package com.example.backend.controller;

import com.example.backend.dto.PagedResponse;
import com.example.backend.dto.admin.AdminAuditLogResponse;
import com.example.backend.entity.AdminAuditAction;
import com.example.backend.entity.AdminAuditTargetType;
import com.example.backend.service.AdminAuditService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAuditLogController {

    private final AdminAuditService adminAuditService;

    @GetMapping
    public PagedResponse<AdminAuditLogResponse> getAuditLogs(
            @RequestParam(required = false)
            String search,

            @RequestParam(required = false)
            AdminAuditAction action,

            @RequestParam(required = false)
            AdminAuditTargetType targetType,

            @RequestParam(defaultValue = "0")
            @Min(0)
            int page,

            @RequestParam(defaultValue = "20")
            @Min(1)
            @Max(100)
            int size,

            @RequestParam(defaultValue = "desc")
            String direction
    ) {
        return adminAuditService.findAll(
                search,
                action,
                targetType,
                page,
                size,
                direction
        );
    }
}