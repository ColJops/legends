package com.example.backend.config;

import jakarta.annotation.PostConstruct;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

import java.net.URI;

@Getter
@Setter
@Validated
@Component
@ConfigurationProperties(prefix = "app.password-reset")
public class PasswordResetProperties {

    @NotBlank
    private String url;

    @Min(1)
    private long expirationMinutes = 60;

    @PostConstruct
    void validateUrl() {
        URI uri;
        try {
            uri = URI.create(url);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(
                    "app.password-reset.url must be a valid URL",
                    exception
            );
        }

        if (!uri.isAbsolute()
                || !("http".equalsIgnoreCase(uri.getScheme())
                || "https".equalsIgnoreCase(uri.getScheme()))) {
            throw new IllegalStateException(
                    "app.password-reset.url must use http or https"
            );
        }
    }
}
