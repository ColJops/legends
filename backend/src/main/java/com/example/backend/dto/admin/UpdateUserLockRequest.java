package com.example.backend.dto.admin;

import jakarta.validation.constraints.NotNull;

public record UpdateUserLockRequest(
        @NotNull Boolean locked
) {
}