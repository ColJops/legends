package com.example.backend.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class PasswordResetEmailDispatchListener {

    private final PasswordResetEmailSender emailSender;

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT,
            fallbackExecution = true
    )
    public void handle(PasswordResetEmailRequestedEvent event) {
        try {
            emailSender.sendPasswordResetEmail(
                    event.recipient(),
                    event.username(),
                    event.resetLink()
            );
        } catch (Exception exception) {
            log.error(
                    "Could not send password reset email for user '{}'",
                    event.username(),
                    exception
            );
        }
    }
}
