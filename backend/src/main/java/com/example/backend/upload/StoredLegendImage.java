package com.example.backend.upload;

import java.time.Instant;

public record StoredLegendImage(
        String filename,
        String url,
        String contentType,
        long sizeBytes,
        Instant lastModified
) {
}