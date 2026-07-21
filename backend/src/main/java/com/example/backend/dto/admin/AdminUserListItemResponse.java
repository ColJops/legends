package com.example.backend.dto.admin;

import com.example.backend.entity.Role;

import java.time.LocalDateTime;

public record AdminUserListItemResponse(
        Long id,
        String username,
        String email,
        Role role,
        boolean enabled,
        boolean locked,
        LocalDateTime createdAt,
        long legendsCount
) {
}