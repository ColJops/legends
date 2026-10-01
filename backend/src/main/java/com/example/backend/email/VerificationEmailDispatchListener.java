package com.example.backend.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class VerificationEmailDispatchListener {

    private final VerificationEmailSender verificationEmailSender;

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT,
            fallbackExecution = true
    )
    public void handle(VerificationEmailRequestedEvent event) {
        try {
            verificationEmailSender.sendVerificationEmail(
                    event.recipient(),
                    event.username(),
                    event.verificationLink()
            );
        } catch (Exception exception) {
            // The account and token are already stored. The user can request
            // another message without repeating registration.
            log.error(
                    "Could not send verification email for user '{}'",
                    event.username(),
                    exception
            );
        }
    }
}
