package com.example.backend.email;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@ConditionalOnProperty(name = "app.mail.mode", havingValue = "log")
public class LoggingPasswordResetEmailSender implements PasswordResetEmailSender {

    @Override
    public void sendPasswordResetEmail(
            String recipient,
            String username,
            String resetLink
    ) {
        log.info(
                "LOCAL PASSWORD RESET for user '{}' at '{}': {}",
                username,
                recipient,
                resetLink
        );
    }
}
