package com.example.backend.service;

import com.example.backend.config.PasswordResetProperties;
import com.example.backend.email.PasswordResetEmailRequestedEvent;
import com.example.backend.entity.PasswordResetToken;
import com.example.backend.entity.User;
import com.example.backend.exception.InvalidPasswordResetTokenException;
import com.example.backend.repository.PasswordResetTokenRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final int TOKEN_BYTES = 32;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;
    private final PasswordResetProperties properties;

    @Transactional
    public void requestReset(String email) {
        String normalizedEmail = email == null
                ? ""
                : email.trim().toLowerCase(Locale.ROOT);

        userRepository.findByEmail(normalizedEmail)
                .filter(User::isEnabled)
                .filter(user -> !user.isLocked())
                .ifPresent(this::issueToken);
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new InvalidPasswordResetTokenException();
        }

        PasswordResetToken token = tokenRepository
                .findByTokenHash(hashToken(rawToken))
                .orElseThrow(InvalidPasswordResetTokenException::new);

        if (!token.getExpiresAt().isAfter(LocalDateTime.now())) {
            throw new InvalidPasswordResetTokenException();
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokenRepository.delete(token);
    }

    private void issueToken(User user) {
        String rawToken = generateRawToken();
        LocalDateTime now = LocalDateTime.now();

        PasswordResetToken token = tokenRepository
                .findByUserId(user.getId())
                .orElseGet(PasswordResetToken::new);
        token.setUser(user);
        token.setTokenHash(hashToken(rawToken));
        token.setCreatedAt(now);
        token.setExpiresAt(now.plusMinutes(properties.getExpirationMinutes()));
        tokenRepository.save(token);

        String resetLink = UriComponentsBuilder
                .fromUriString(properties.getUrl())
                .queryParam("token", rawToken)
                .build()
                .toUriString();

        eventPublisher.publishEvent(
                new PasswordResetEmailRequestedEvent(
                        user.getEmail(),
                        user.getUsername(),
                        resetLink
                )
        );
    }

    private String generateRawToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256")
                    .digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "SHA-256 is not available",
                    exception
            );
        }
    }
}
