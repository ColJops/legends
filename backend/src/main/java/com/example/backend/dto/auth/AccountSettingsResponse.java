package com.example.backend.dto.auth;

import java.time.LocalDateTime;

public record AccountSettingsResponse(
        String username,
        String email,
        String role,
        LocalDateTime createdAt
) {
}
