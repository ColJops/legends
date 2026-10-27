package com.example.backend.email;

public interface PasswordResetEmailSender {

    void sendPasswordResetEmail(
            String recipient,
            String username,
            String resetLink
    );
}
