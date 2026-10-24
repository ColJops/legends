package com.example.backend.dto.admin;

import com.example.backend.entity.Role;

import java.time.LocalDateTime;
import java.util.UUID;

public record AdminUserListItemResponse(
        UUID id,
        String username,
        String email,
        Role role,
        boolean enabled,
        boolean locked,
        LocalDateTime createdAt,
        long legendsCount
) {
}