package com.example.backend.controller;

import com.example.backend.dto.admin.AdminMediaCleanupResponse;
import com.example.backend.dto.admin.AdminMediaResponse;
import com.example.backend.service.AdminMediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/media")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminMediaController {

    private final AdminMediaService adminMediaService;

    @GetMapping
    public AdminMediaResponse getMedia() {
        return adminMediaService.getMedia();
    }

    @DeleteMapping("/{filename:.+}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOrphanedFile(
            @PathVariable String filename
    ) {
        adminMediaService.deleteOrphanedFile(
                filename
        );
    }

    @PostMapping("/cleanup-orphans")
    public AdminMediaCleanupResponse cleanupOrphans() {
        return adminMediaService.cleanupOrphans();
    }
}