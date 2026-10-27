package com.example.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank(message = "Email jest wymagany")
        @Email(message = "Podaj poprawny adres email")
        String email
) {
}
