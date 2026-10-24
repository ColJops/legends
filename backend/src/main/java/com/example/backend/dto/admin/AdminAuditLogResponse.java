package com.example.backend.dto.admin;

import com.example.backend.entity.AdminAuditAction;
import com.example.backend.entity.AdminAuditTargetType;

import java.time.LocalDateTime;
import java.util.UUID;

public record AdminAuditLogResponse(
        UUID id,
        UUID adminId,
        String adminUsername,
        AdminAuditAction action,
        AdminAuditTargetType targetType,
        UUID targetId,
        String targetLabel,
        String details,
        LocalDateTime createdAt
) {
}