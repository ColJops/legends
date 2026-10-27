package com.example.backend.service;

import com.example.backend.config.PasswordResetProperties;
import com.example.backend.email.PasswordResetEmailRequestedEvent;
import com.example.backend.entity.PasswordResetToken;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.exception.InvalidPasswordResetTokenException;
import com.example.backend.repository.PasswordResetTokenRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    private PasswordResetService service;

    @BeforeEach
    void setUp() {
        PasswordResetProperties properties = new PasswordResetProperties();
        properties.setUrl("http://localhost:5173/reset-password");
        properties.setExpirationMinutes(60);
        service = new PasswordResetService(
                tokenRepository,
                userRepository,
                passwordEncoder,
                eventPublisher,
                properties
        );
    }

    @Test
    void requestResetStoresOnlyHashAndPublishesLink() {
        User user = user(true, false);
        when(userRepository.findByEmail("user@example.com"))
                .thenReturn(Optional.of(user));
        when(tokenRepository.findByUserId(user.getId()))
                .thenReturn(Optional.empty());
        when(tokenRepository.save(any(PasswordResetToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        service.requestReset(" USER@EXAMPLE.COM ");

        ArgumentCaptor<PasswordResetToken> tokenCaptor =
                ArgumentCaptor.forClass(PasswordResetToken.class);
        ArgumentCaptor<PasswordResetEmailRequestedEvent> eventCaptor =
                ArgumentCaptor.forClass(PasswordResetEmailRequestedEvent.class);
        verify(tokenRepository).save(tokenCaptor.capture());
        verify(eventPublisher).publishEvent(eventCaptor.capture());

        PasswordResetToken stored = tokenCaptor.getValue();
        String rawToken = tokenFrom(eventCaptor.getValue().resetLink());
        assertThat(stored.getTokenHash()).hasSize(64).isEqualTo(hash(rawToken));
        assertThat(stored.getExpiresAt()).isAfter(stored.getCreatedAt());
        assertThat(eventCaptor.getValue().recipient())
                .isEqualTo("user@example.com");
        assertThat(eventCaptor.getValue().resetLink())
                .startsWith("http://localhost:5173/reset-password?token=");
    }

    @Test
    void requestResetDoesNotRevealOrIssueTokenForUnknownAccount() {
        when(userRepository.findByEmail("missing@example.com"))
                .thenReturn(Optional.empty());

        service.requestReset(" MISSING@EXAMPLE.COM ");

        verify(tokenRepository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(
                any(PasswordResetEmailRequestedEvent.class)
        );
    }

    @Test
    void requestResetDoesNotIssueTokenForDisabledOrLockedAccount() {
        when(userRepository.findByEmail("disabled@example.com"))
                .thenReturn(Optional.of(user(false, false)));
        when(userRepository.findByEmail("locked@example.com"))
                .thenReturn(Optional.of(user(true, true)));

        service.requestReset("disabled@example.com");
        service.requestReset("locked@example.com");

        verify(tokenRepository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(
                any(PasswordResetEmailRequestedEvent.class)
        );
    }

    @Test
    void resetUpdatesPasswordAndConsumesToken() {
        String rawToken = "valid-reset-token";
        User user = user(true, false);
        PasswordResetToken token = token(rawToken, user, 1);
        when(tokenRepository.findByTokenHash(hash(rawToken)))
                .thenReturn(Optional.of(token));
        when(passwordEncoder.encode("new-password"))
                .thenReturn("encoded-new-password");

        service.resetPassword(rawToken, "new-password");

        assertThat(user.getPassword()).isEqualTo("encoded-new-password");
        verify(userRepository).save(user);
        verify(tokenRepository).delete(token);
    }

    @Test
    void resetRejectsExpiredTokenWithoutChangingPassword() {
        String rawToken = "expired-reset-token";
        User user = user(true, false);
        PasswordResetToken token = token(rawToken, user, -1);
        when(tokenRepository.findByTokenHash(hash(rawToken)))
                .thenReturn(Optional.of(token));

        assertThatThrownBy(() -> service.resetPassword(rawToken, "new-password"))
                .isInstanceOf(InvalidPasswordResetTokenException.class);

        verify(userRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(any());
        verify(tokenRepository, never()).delete(any());
    }

    @Test
    void resetRejectsUnknownAndAlreadyConsumedToken() {
        String rawToken = "one-time-reset-token";
        User user = user(true, false);
        PasswordResetToken token = token(rawToken, user, 1);
        when(tokenRepository.findByTokenHash(hash(rawToken)))
                .thenReturn(Optional.of(token), Optional.empty());
        when(passwordEncoder.encode("new-password"))
                .thenReturn("encoded-new-password");

        service.resetPassword(rawToken, "new-password");

        assertThatThrownBy(() -> service.resetPassword(rawToken, "new-password"))
                .isInstanceOf(InvalidPasswordResetTokenException.class);
        verify(userRepository).save(user);
        verify(tokenRepository).delete(token);
    }

    @Test
    void newRequestInvalidatesPreviousResetToken() {
        User user = user(true, false);
        PasswordResetToken existing = token("old-reset-token", user, 1);
        when(userRepository.findByEmail("user@example.com"))
                .thenReturn(Optional.of(user));
        when(tokenRepository.findByUserId(user.getId()))
                .thenReturn(Optional.of(existing));
        when(tokenRepository.findByTokenHash(hash("old-reset-token")))
                .thenReturn(Optional.empty());
        when(tokenRepository.save(any(PasswordResetToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        service.requestReset(user.getEmail());

        ArgumentCaptor<PasswordResetEmailRequestedEvent> eventCaptor =
                ArgumentCaptor.forClass(PasswordResetEmailRequestedEvent.class);
        verify(eventPublisher).publishEvent(eventCaptor.capture());
        assertThat(existing.getTokenHash())
                .isEqualTo(hash(tokenFrom(eventCaptor.getValue().resetLink())))
                .isNotEqualTo(hash("old-reset-token"));
        assertThatThrownBy(() -> service.resetPassword(
                "old-reset-token",
                "new-password"
        )).isInstanceOf(InvalidPasswordResetTokenException.class);
    }

    private User user(boolean enabled, boolean locked) {
        return User.builder()
                .id(UUID.fromString("00000000-0000-0000-0000-000000000005"))
                .username("user")
                .email("user@example.com")
                .password("old-password-hash")
                .role(Role.USER)
                .enabled(enabled)
                .locked(locked)
                .build();
    }

    private PasswordResetToken token(
            String rawToken,
            User user,
            long expirationOffsetHours
    ) {
        return PasswordResetToken.builder()
                .id(UUID.fromString("00000000-0000-0000-0000-000000000012"))
                .user(user)
                .tokenHash(hash(rawToken))
                .createdAt(LocalDateTime.now().minusMinutes(1))
                .expiresAt(LocalDateTime.now().plusHours(expirationOffsetHours))
                .build();
    }

    private String tokenFrom(String link) {
        return link.substring(link.indexOf("token=") + "token=".length());
    }

    private String hash(String value) {
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256")
                            .digest(value.getBytes(StandardCharsets.UTF_8))
            );
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }
}
