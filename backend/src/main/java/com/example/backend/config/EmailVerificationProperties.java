package com.example.backend.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Validated
@Component
@ConfigurationProperties(prefix = "app.email-verification")
public class EmailVerificationProperties {

    @NotBlank
    private String url;

    @Min(1)
    private long expirationHours = 24;

    @PostConstruct
    void validateUrl() {
        java.net.URI uri;
        try {
            uri = java.net.URI.create(url);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(
                    "app.email-verification.url must be a valid URL",
                    exception
            );
        }

        if (!uri.isAbsolute()
                || !("http".equalsIgnoreCase(uri.getScheme())
                || "https".equalsIgnoreCase(uri.getScheme()))) {
            throw new IllegalStateException(
                    "app.email-verification.url must use http or https"
            );
        }
    }
}
