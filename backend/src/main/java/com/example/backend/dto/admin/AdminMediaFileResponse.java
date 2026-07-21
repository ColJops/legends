package com.example.backend.dto.admin;

import java.time.Instant;
import java.util.List;

public record AdminMediaFileResponse(
        String filename,
        String url,
        String contentType,
        long sizeBytes,
        Instant lastModified,
        boolean orphaned,
        List<AdminMediaLegendReferenceResponse> usedBy
) {
}