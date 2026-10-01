package com.example.backend.service;

import com.example.backend.config.EmailVerificationProperties;
import com.example.backend.email.VerificationEmailRequestedEvent;
import com.example.backend.entity.EmailVerificationToken;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.exception.InvalidEmailVerificationTokenException;
import com.example.backend.repository.EmailVerificationTokenRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmailVerificationServiceTest {

    @Mock
    private EmailVerificationTokenRepository tokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    private EmailVerificationService service;

    @BeforeEach
    void setUp() {
        EmailVerificationProperties properties =
                new EmailVerificationProperties();
        properties.setUrl("http://localhost:8080/api/auth/verify-email");
        properties.setExpirationHours(24);

        service = new EmailVerificationService(
                tokenRepository,
                userRepository,
                eventPublisher,
                properties
        );
    }

    @Test
    void issueTokenStoresOnlyHashAndPublishesRawTokenInLink() {
        User user = user(false);
        when(tokenRepository.findByUserId(5L))
                .thenReturn(Optional.empty());
        when(tokenRepository.save(any(EmailVerificationToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        service.issueToken(user);

        ArgumentCaptor<EmailVerificationToken> tokenCaptor =
                ArgumentCaptor.forClass(EmailVerificationToken.class);
        verify(tokenRepository).save(tokenCaptor.capture());

        ArgumentCaptor<VerificationEmailRequestedEvent> eventCaptor =
                ArgumentCaptor.forClass(VerificationEmailRequestedEvent.class);
        verify(eventPublisher).publishEvent(eventCaptor.capture());

        EmailVerificationToken stored = tokenCaptor.getValue();
        VerificationEmailRequestedEvent event = eventCaptor.getValue();
        String rawToken = event.verificationLink().substring(
                event.verificationLink().indexOf("token=") + 6
        );

        assertThat(stored.getUser()).isSameAs(user);
        assertThat(stored.getTokenHash()).hasSize(64);
        assertThat(stored.getTokenHash()).isEqualTo(hash(rawToken));
        assertThat(stored.getExpiresAt()).isAfter(stored.getCreatedAt());
        assertThat(event.recipient()).isEqualTo("user@example.com");
    }

    @Test
    void verifyEnablesUserAndConsumesToken() {
        String rawToken = "valid-raw-token";
        User user = user(false);
        EmailVerificationToken token = EmailVerificationToken.builder()
                .id(12L)
                .user(user)
                .tokenHash(hash(rawToken))
                .createdAt(LocalDateTime.now().minusMinutes(1))
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();
        when(tokenRepository.findByTokenHash(hash(rawToken)))
                .thenReturn(Optional.of(token));

        service.verify(rawToken);

        assertThat(user.isEnabled()).isTrue();
        verify(userRepository).save(user);
        verify(tokenRepository).delete(token);
    }

    @Test
    void verifyRejectsExpiredTokenWithoutActivatingUser() {
        String rawToken = "expired-raw-token";
        User user = user(false);
        EmailVerificationToken token = EmailVerificationToken.builder()
                .id(12L)
                .user(user)
                .tokenHash(hash(rawToken))
                .createdAt(LocalDateTime.now().minusDays(2))
                .expiresAt(LocalDateTime.now().minusMinutes(1))
                .build();
        when(tokenRepository.findByTokenHash(hash(rawToken)))
                .thenReturn(Optional.of(token));

        assertThatThrownBy(() -> service.verify(rawToken))
                .isInstanceOf(InvalidEmailVerificationTokenException.class);

        assertThat(user.isEnabled()).isFalse();
        verify(userRepository, never()).save(any());
        verify(tokenRepository, never()).delete(any());
    }

    @Test
    void resendDoesNotRevealMissingAccountAndDoesNotCreateToken() {
        when(userRepository.findByEmail("missing@example.com"))
                .thenReturn(Optional.empty());

        service.resend(" MISSING@EXAMPLE.COM ");

        verify(tokenRepository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(
                any(VerificationEmailRequestedEvent.class)
        );
    }

    private User user(boolean enabled) {
        return User.builder()
                .id(5L)
                .username("user")
                .email("user@example.com")
                .password("encoded")
                .role(Role.USER)
                .enabled(enabled)
                .locked(false)
                .build();
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(
                    digest.digest(value.getBytes(StandardCharsets.UTF_8))
            );
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }
}
