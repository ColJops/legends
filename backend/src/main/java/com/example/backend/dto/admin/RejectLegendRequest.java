package com.example.backend.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RejectLegendRequest(
        @NotBlank(message = "Powód odrzucenia jest wymagany")
        @Size(max = 1000, message = "Powód może mieć maksymalnie 1000 znaków")
        String rejectionReason,

        @Size(max = 2000, message = "Notatka moderatora może mieć maksymalnie 2000 znaków")
        String moderationNotes
) {
}
