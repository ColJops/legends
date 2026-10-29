package com.example.backend.dto.admin;

import jakarta.validation.constraints.Size;

public record ModerationDecisionRequest(
        @Size(max = 2000, message = "Notatka moderatora może mieć maksymalnie 2000 znaków")
        String moderationNotes
) {
}
