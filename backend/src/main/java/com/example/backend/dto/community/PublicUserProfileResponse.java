package com.example.backend.dto.community;

import com.example.backend.dto.LegendResponse;
import java.time.LocalDateTime;
import java.util.List;

public record PublicUserProfileResponse(
        String username,
        boolean publicProfile,
        // Pola zwracane wyłącznie gdy publicProfile == true (dla prywatnego ustawiane na null):
        String avatarUrl,
        LocalDateTime joinedAt,
        String role,
        // Aktywność widoczna zawsze (zarówno dla profilu publicznego, jak i prywatnego):
        long publishedLegendsCount,
        long commentsCount,
        long ratingsGivenCount,
        List<LegendResponse> publishedLegends
) {}
