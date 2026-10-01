package com.example.backend.service;

import com.example.backend.config.EmailVerificationProperties;
import com.example.backend.email.VerificationEmailRequestedEvent;
import com.example.backend.entity.EmailVerificationToken;
import com.example.backend.entity.User;
import com.example.backend.exception.InvalidEmailVerificationTokenException;
import com.example.backend.repository.EmailVerificationTokenRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
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

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private static final int TOKEN_BYTES = 32;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final EmailVerificationProperties properties;

    @Transactional
    public void issueToken(User user) {
        String rawToken = generateRawToken();
        LocalDateTime now = LocalDateTime.now();

        EmailVerificationToken token = tokenRepository
                .findByUserId(user.getId())
                .orElseGet(EmailVerificationToken::new);

        token.setUser(user);
        token.setTokenHash(hashToken(rawToken));
        token.setCreatedAt(now);
        token.setExpiresAt(
                now.plusHours(properties.getExpirationHours())
        );

        tokenRepository.save(token);

        String verificationLink = UriComponentsBuilder
                .fromUriString(properties.getUrl())
                .queryParam("token", rawToken)
                .build()
                .toUriString();

        eventPublisher.publishEvent(
                new VerificationEmailRequestedEvent(
                        user.getEmail(),
                        user.getUsername(),
                        verificationLink
                )
        );
    }

    @Transactional
    public void verify(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new InvalidEmailVerificationTokenException();
        }

        EmailVerificationToken token = tokenRepository
                .findByTokenHash(hashToken(rawToken))
                .orElseThrow(InvalidEmailVerificationTokenException::new);

        if (!token.getExpiresAt().isAfter(LocalDateTime.now())) {
            throw new InvalidEmailVerificationTokenException();
        }

        User user = token.getUser();
        user.setEnabled(true);
        userRepository.save(user);
        tokenRepository.delete(token);
    }

    @Transactional
    public void resend(String email) {
        String normalizedEmail = normalizeEmail(email);

        userRepository.findByEmail(normalizedEmail)
                .filter(user -> !user.isEnabled())
                .filter(user -> !user.isLocked())
                .ifPresent(this::issueToken);
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
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(
                    rawToken.getBytes(StandardCharsets.UTF_8)
            );
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "SHA-256 is not available",
                    exception
            );
        }
    }

    private String normalizeEmail(String email) {
        return email == null
                ? ""
                : email.trim().toLowerCase(java.util.Locale.ROOT);
    }
}
