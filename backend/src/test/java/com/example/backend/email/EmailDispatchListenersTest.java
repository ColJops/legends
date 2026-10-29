package com.example.backend.email;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class EmailDispatchListenersTest {

    @Mock
    private VerificationEmailSender verificationEmailSender;

    @Mock
    private PasswordResetEmailSender passwordResetEmailSender;

    @InjectMocks
    private VerificationEmailDispatchListener verificationListener;

    @InjectMocks
    private PasswordResetEmailDispatchListener passwordResetListener;

    @Test
    void dispatchesVerificationEmailAndSwallowsSenderExceptions() {
        VerificationEmailRequestedEvent event = new VerificationEmailRequestedEvent(
                "user@example.com", "user", "http://localhost:8080/verify?token=123"
        );

        verificationListener.handle(event);

        verify(verificationEmailSender).sendVerificationEmail(
                "user@example.com", "user", "http://localhost:8080/verify?token=123"
        );

        doThrow(new RuntimeException("SMTP down"))
                .when(verificationEmailSender)
                .sendVerificationEmail(event.recipient(), event.username(), event.verificationLink());

        assertThatCode(() -> verificationListener.handle(event))
                .doesNotThrowAnyException();

        verify(verificationEmailSender, times(2)).sendVerificationEmail(
                event.recipient(), event.username(), event.verificationLink()
        );
    }

    @Test
    void dispatchesPasswordResetEmailAndSwallowsSenderExceptions() {
        PasswordResetEmailRequestedEvent event = new PasswordResetEmailRequestedEvent(
                "user@example.com", "user", "http://localhost:5173/reset?token=456"
        );

        passwordResetListener.handle(event);

        verify(passwordResetEmailSender).sendPasswordResetEmail(
                "user@example.com", "user", "http://localhost:5173/reset?token=456"
        );

        doThrow(new RuntimeException("SMTP down"))
                .when(passwordResetEmailSender)
                .sendPasswordResetEmail(event.recipient(), event.username(), event.resetLink());

        assertThatCode(() -> passwordResetListener.handle(event))
                .doesNotThrowAnyException();

        verify(passwordResetEmailSender, times(2)).sendPasswordResetEmail(
                event.recipient(), event.username(), event.resetLink()
        );
    }
}
