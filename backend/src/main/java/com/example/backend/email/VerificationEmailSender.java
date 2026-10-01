package com.example.backend.email;

public interface VerificationEmailSender {

    void sendVerificationEmail(
            String recipient,
            String username,
            String verificationLink
    );
}
