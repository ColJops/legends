package com.example.backend.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String VALID_BASE64_SECRET =
            "D09jItv+bW8DZaiDi0Gbjdz43knHYDUV7C5F8jXjb5Q=";

    @Test
    void generatesAndValidatesTokenForMatchingUsername() {
        JwtService jwtService = new JwtService(VALID_BASE64_SECRET, 3600000L);

        String token = jwtService.generateToken("maravoss");

        assertThat(token).isNotBlank();
        assertThat(jwtService.extractUsername(token)).isEqualTo("maravoss");
        assertThat(jwtService.isTokenValid(token, "maravoss")).isTrue();
        assertThat(jwtService.isTokenValid(token, "otheruser")).isFalse();
    }

    @Test
    void rejectsBlankOrInvalidBase64SecretAndShortKeys() {
        assertThatThrownBy(() -> new JwtService("   ", 3600000L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("must not be blank");

        assertThatThrownBy(() -> new JwtService("!!!not-base64!!!", 3600000L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("valid Base64");

        // "dG9vc2hvcnQ=" to "tooshort" (8 bajtów < 32 bajty)
        assertThatThrownBy(() -> new JwtService("dG9vc2hvcnQ=", 3600000L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("at least 32 decoded bytes");
    }

    @Test
    void rejectsNonPositiveExpiration() {
        assertThatThrownBy(() -> new JwtService(VALID_BASE64_SECRET, 0L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("greater than zero");
    }
}