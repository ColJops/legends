package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LegendRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 150, message = "Title cannot exceed 150 characters")
        String title,

        @NotBlank(message = "Content is required")
        String content,

        @Size(max = 100)
        String region,

        @Size(max = 100)
        String city,

        @Size(max = 80)
        String category,

        @Size(max = 255)
        String imageUrl
) {
}
