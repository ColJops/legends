package com.example.backend.dto.auth;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateProfileVisibilityRequest(
        @NotNull(message = "Określ widoczność profilu")
        Boolean publicProfile,

        @Size(max = 500, message = "Adres avatara może mieć maksymalnie 500 znaków")
        String avatarUrl
) {
}