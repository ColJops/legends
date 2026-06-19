package com.example.backend.dto.auth;

public record AuthResponse(

        String message,
        String username,
        String role,
        String token
) {
}
