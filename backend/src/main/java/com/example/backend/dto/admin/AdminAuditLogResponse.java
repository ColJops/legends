package com.example.backend.dto.admin;

import com.example.backend.entity.AdminAuditAction;
import com.example.backend.entity.AdminAuditTargetType;

import java.time.LocalDateTime;

public record AdminAuditLogResponse(
        Long id,
        Long adminId,
        String adminUsername,
        AdminAuditAction action,
        AdminAuditTargetType targetType,
        Long targetId,
        String targetLabel,
        String details,
        LocalDateTime createdAt
) {
}