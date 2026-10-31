package com.example.backend.dto.community;

import java.time.LocalDateTime;
import java.util.UUID;

public record CommentResponse(
        UUID id,
        UUID legendId,
        UUID authorId,
        String authorUsername,
        String authorAvatarUrl,
        String content,
        LocalDateTime createdAt
) {}
