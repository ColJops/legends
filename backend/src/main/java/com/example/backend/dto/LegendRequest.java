package com.example.backend.dto;

import com.example.backend.entity.LegendCategory;
import com.example.backend.entity.Region;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LegendRequest(
        @NotBlank(message = "Tytuł jest wymagany")
        @Size(max = 150, message = "Tytuł może mieć maksymalnie 150 znaków")
        String title,

        @NotBlank(message = "Treść legendy jest wymagana")
        @Size(max = 10000, message = "Treść legendy może mieć maksymalnie 10000 znaków")
        String content,

        @NotNull(message = "Region jest wymagany")
        Region region,

        @NotBlank(message = "Miasto jest wymagane")
        @Size(max = 100, message = "Miasto może mieć maksymalnie 100 znaków")
        String city,

        @NotNull(message = "Kategoria jest wymagana")
        LegendCategory category,

        @Size(max = 500, message = "Adres obrazka może mieć maksymalnie 500 znaków")
        String imageUrl
) {
}