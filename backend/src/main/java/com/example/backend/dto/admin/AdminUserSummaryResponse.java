package com.example.backend.dto.admin;

import com.example.backend.entity.Role;

import java.time.LocalDateTime;
import java.util.UUID;

public record AdminUserSummaryResponse(
        UUID id,
        String username,
        String email,
        Role role,
        LocalDateTime createdAt
) {
}