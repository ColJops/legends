package com.example.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Nazwa użytkownika jest wymagana")
        @Size(min = 3, max = 50, message = "Nazwa użytkownika musi mieć od 3 do 50 znaków")
        String username,

        @NotBlank(message = "Email jest wymagany")
        @Email(message = "Podaj poprawny adres email")
        String email,

        @NotBlank(message = "Hasło jest wymagane")
        @Size(min = 8, max = 100, message = "Hasło musi mieć od 8 do 100 znaków")
        String password
) {
}
