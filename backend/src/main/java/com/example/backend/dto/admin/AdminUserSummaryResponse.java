package com.example.backend.dto.admin;

import com.example.backend.entity.Role;

import java.time.LocalDateTime;

public record AdminUserSummaryResponse(
        Long id,
        String username,
        String email,
        Role role,
        LocalDateTime createdAt
) {
}