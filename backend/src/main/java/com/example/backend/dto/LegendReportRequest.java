package com.example.backend.dto;

import com.example.backend.entity.LegendReportReason;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LegendReportRequest(
        @NotNull(message = "Wybierz powód zgłoszenia")
        LegendReportReason reason,

        @Size(max = 1000, message = "Szczegóły mogą mieć maksymalnie 1000 znaków")
        String details
) {
}
