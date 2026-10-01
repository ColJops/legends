package com.example.backend.email;

public record VerificationEmailRequestedEvent(
        String recipient,
        String username,
        String verificationLink
) {
}
