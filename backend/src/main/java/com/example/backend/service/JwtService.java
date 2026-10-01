package com.example.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private static final int MINIMUM_HS256_KEY_BYTES = 32;

    private final SecretKey signingKey;
    private final long expiration;

    public JwtService(
            @Value("${jwt.secret-base64}") String encodedSecret,
            @Value("${jwt.expiration}") long expiration
    ) {
        if (encodedSecret == null || encodedSecret.isBlank()) {
            throw new IllegalStateException(
                    "Property jwt.secret-base64 must not be blank"
            );
        }

        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(encodedSecret.trim());
        } catch (RuntimeException exception) {
            throw new IllegalStateException(
                    "Property jwt.secret-base64 must contain a valid Base64 value",
                    exception
            );
        }

        if (keyBytes.length < MINIMUM_HS256_KEY_BYTES) {
            throw new IllegalStateException(
                    "JWT signing key must contain at least 32 decoded bytes for HS256"
            );
        }

        if (expiration <= 0) {
            throw new IllegalStateException(
                    "Property jwt.expiration must be greater than zero"
            );
        }

        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expiration = expiration;
    }

    public String generateToken(String username) {
        Date issuedAt = new Date();
        Date expiresAt = new Date(issuedAt.getTime() + expiration);

        return Jwts.builder()
                .subject(username)
                .issuedAt(issuedAt)
                .expiration(expiresAt)
                .signWith(signingKey)
                .compact();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, String username) {
        return extractUsername(token).equals(username)
                && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token)
                .getExpiration()
                .before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
