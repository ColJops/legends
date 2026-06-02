package com.example.backend.dto;

import com.example.backend.entity.LegendCategory;
import com.example.backend.entity.Region;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LegendRequest(
        @NotBlank
        @Size(max = 150)
        String title,

        @NotBlank
        String content,

        @NotNull
        Region region,

        @Size(max = 100)
        String city,

        @NotNull
        LegendCategory category,

        @Size(max = 255)
        String imageUrl
) {
}