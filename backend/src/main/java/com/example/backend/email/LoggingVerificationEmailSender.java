package com.example.backend.email;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@ConditionalOnProperty(name = "app.mail.mode", havingValue = "log")
public class LoggingVerificationEmailSender
        implements VerificationEmailSender {

    @Override
    public void sendVerificationEmail(
            String recipient,
            String username,
            String verificationLink
    ) {
        log.info(
                "LOCAL EMAIL VERIFICATION for user '{}' at '{}': {}",
                username,
                recipient,
                verificationLink
        );
    }
}
