package com.example.backend.dto.community;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentRequest(
        @NotBlank(message = "Treść komentarza jest wymagana")
        @Size(max = 2000, message = "Komentarz może mieć maksymalnie 2000 znaków")
        String content
) {}
