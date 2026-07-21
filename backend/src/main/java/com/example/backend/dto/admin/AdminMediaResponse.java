package com.example.backend.dto.admin;

import java.util.List;

public record AdminMediaResponse(
        long totalFiles,
        long usedFiles,
        long orphanedFiles,
        long totalSizeBytes,
        List<AdminMediaFileResponse> files
) {
}