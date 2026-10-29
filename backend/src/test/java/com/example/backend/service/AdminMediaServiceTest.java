package com.example.backend.service;

import com.example.backend.dto.admin.AdminMediaCleanupResponse;
import com.example.backend.dto.admin.AdminMediaResponse;
import com.example.backend.entity.AdminAuditAction;
import com.example.backend.entity.AdminAuditTargetType;
import com.example.backend.exception.AdminOperationNotAllowedException;
import com.example.backend.exception.MediaFileNotFoundException;
import com.example.backend.repository.LegendRepository;
import com.example.backend.upload.FileUploadService;
import com.example.backend.upload.StoredLegendImage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminMediaServiceTest {

    @Mock
    private LegendRepository legendRepository;

    @Mock
    private FileUploadService fileUploadService;

    @Mock
    private AdminAuditService adminAuditService;

    @InjectMocks
    private AdminMediaService adminMediaService;

    @Test
    void getMediaCalculatesOrphanedAndUsedStats() {
        StoredLegendImage orphan = new StoredLegendImage(
                "orphan.png", "/uploads/legends/orphan.png", "image/png", 1024L, Instant.now()
        );
        when(legendRepository.findImageUsages()).thenReturn(List.of());
        when(fileUploadService.listLegendImages()).thenReturn(List.of(orphan));

        AdminMediaResponse response = adminMediaService.getMedia();

        assertThat(response.totalFiles()).isEqualTo(1);
        assertThat(response.orphanedFiles()).isEqualTo(1);
        assertThat(response.usedFiles()).isZero();
        assertThat(response.totalSizeBytes()).isEqualTo(1024L);
    }

    @Test
    void preventsDeletingFileCurrentlyUsedByLegend() {
        when(legendRepository.findAllImageUrls())
                .thenReturn(List.of("/uploads/legends/used.png"));
        when(fileUploadService.extractLegendImageFilename("/uploads/legends/used.png"))
                .thenReturn("used.png");

        assertThatThrownBy(() -> adminMediaService.deleteOrphanedFile("used.png"))
                .isInstanceOf(AdminOperationNotAllowedException.class)
                .hasMessageContaining("używanego przez legendę");

        verify(fileUploadService, never()).deleteLegendImageByFilename(any());
    }

    @Test
    void throwsMediaFileNotFoundWhenOrphanDoesNotExistOnDisk() {
        when(legendRepository.findAllImageUrls()).thenReturn(List.of());
        when(fileUploadService.deleteLegendImageByFilename("missing.png")).thenReturn(false);

        assertThatThrownBy(() -> adminMediaService.deleteOrphanedFile("missing.png"))
                .isInstanceOf(MediaFileNotFoundException.class);
    }

    @Test
    void deletesOrphanedFileAndLogsAuditEvent() {
        when(legendRepository.findAllImageUrls()).thenReturn(List.of());
        when(fileUploadService.deleteLegendImageByFilename("orphan.png")).thenReturn(true);

        adminMediaService.deleteOrphanedFile("orphan.png");

        verify(adminAuditService).record(
                AdminAuditAction.MEDIA_FILE_DELETED,
                AdminAuditTargetType.MEDIA,
                null,
                "orphan.png",
                "Usunięto osierocony plik obrazu"
        );
    }

    @Test
    void cleanupOrphansDeletesUnusedImagesAndLogsAudit() {
        List<String> usedUrls = List.of("/uploads/legends/keep.png");
        when(legendRepository.findAllImageUrls()).thenReturn(usedUrls);
        when(fileUploadService.cleanupOrphanedLegendImages(usedUrls)).thenReturn(3);

        AdminMediaCleanupResponse response = adminMediaService.cleanupOrphans();

        assertThat(response.deletedFiles()).isEqualTo(3);
        verify(adminAuditService).record(
                eq(AdminAuditAction.MEDIA_ORPHANS_CLEANED),
                eq(AdminAuditTargetType.SYSTEM),
                isNull(),
                anyString(),
                contains("3")
        );
    }
}
