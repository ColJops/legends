package com.example.backend.dto.community;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record RatingRequest(
        @Min(value = 1, message = "Minimalna ocena to 1")
        @Max(value = 5, message = "Maksymalna ocena to 5")
        int rating
) {}
