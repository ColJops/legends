package com.example.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank(message = "Obecne hasło jest wymagane")
        @Size(max = 100, message = "Hasło może mieć maksymalnie 100 znaków")
        String currentPassword,

        @NotBlank(message = "Nowe hasło jest wymagane")
        @Size(min = 8, max = 100, message = "Hasło musi mieć od 8 do 100 znaków")
        String newPassword
) {
}
