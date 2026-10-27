package com.example.backend.email;

public record PasswordResetEmailRequestedEvent(
        String recipient,
        String username,
        String resetLink
) {
}
