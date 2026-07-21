package com.example.backend.service;

import com.example.backend.dto.admin.AdminMediaCleanupResponse;
import com.example.backend.dto.admin.AdminMediaFileResponse;
import com.example.backend.dto.admin.AdminMediaLegendReferenceResponse;
import com.example.backend.dto.admin.AdminMediaResponse;
import com.example.backend.entity.AdminAuditAction;
import com.example.backend.entity.AdminAuditTargetType;
import com.example.backend.exception.AdminOperationNotAllowedException;
import com.example.backend.exception.MediaFileNotFoundException;
import com.example.backend.repository.LegendRepository;
import com.example.backend.repository.projection.LegendImageUsageProjection;
import com.example.backend.upload.FileUploadService;
import com.example.backend.upload.StoredLegendImage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminMediaService {

    private final LegendRepository legendRepository;
    private final FileUploadService fileUploadService;
    private final AdminAuditService adminAuditService;

    @Transactional(readOnly = true)
    public AdminMediaResponse getMedia() {
        Map<String, List<AdminMediaLegendReferenceResponse>>
                usagesByFilename = getUsagesByFilename();

        List<AdminMediaFileResponse> files =
                fileUploadService.listLegendImages()
                        .stream()
                        .map(file ->
                                mapFile(
                                        file,
                                        usagesByFilename
                                )
                        )
                        .toList();

        long usedFiles = files.stream()
                .filter(file -> !file.orphaned())
                .count();

        long orphanedFiles = files.stream()
                .filter(AdminMediaFileResponse::orphaned)
                .count();

        long totalSizeBytes = files.stream()
                .mapToLong(
                        AdminMediaFileResponse::sizeBytes
                )
                .sum();

        return new AdminMediaResponse(
                files.size(),
                usedFiles,
                orphanedFiles,
                totalSizeBytes,
                files
        );
    }

    @Transactional
    public void deleteOrphanedFile(String filename) {
        boolean used = legendRepository
                .findAllImageUrls()
                .stream()
                .map(fileUploadService::extractLegendImageFilename)
                .anyMatch(filename::equals);

        if (used) {
            throw new AdminOperationNotAllowedException(
                    "Nie można usunąć obrazu używanego przez legendę"
            );
        }

        boolean deleted =
                fileUploadService.deleteLegendImageByFilename(filename);

        if (!deleted) {
            throw new MediaFileNotFoundException(filename);
        }

        adminAuditService.record(
                AdminAuditAction.MEDIA_FILE_DELETED,
                AdminAuditTargetType.MEDIA,
                null,
                filename,
                "Usunięto osierocony plik obrazu"
        );
    }

    public AdminMediaCleanupResponse cleanupOrphans() {
        int deletedFiles =
                fileUploadService
                        .cleanupOrphanedLegendImages(
                                legendRepository.findAllImageUrls()
                        );

        adminAuditService.record(
                AdminAuditAction.MEDIA_ORPHANS_CLEANED,
                AdminAuditTargetType.SYSTEM,
                null,
                "Czyszczenie osieroconych obrazów",
                "Liczba usuniętych plików: "
                        + deletedFiles
        );

        return new AdminMediaCleanupResponse(
                deletedFiles
        );
    }

    private Map<
            String,
            List<AdminMediaLegendReferenceResponse>
            > getUsagesByFilename() {

        Map<
                String,
                List<AdminMediaLegendReferenceResponse>
                > result = new LinkedHashMap<>();

        for (
                LegendImageUsageProjection usage
                : legendRepository.findImageUsages()
        ) {
            String filename =
                    fileUploadService
                            .extractLegendImageFilename(
                                    usage.getImageUrl()
                            );

            if (filename.isBlank()) {
                continue;
            }

            result.computeIfAbsent(
                    filename,
                    ignored -> new ArrayList<>()
            ).add(
                    new AdminMediaLegendReferenceResponse(
                            usage.getId(),
                            usage.getTitle()
                    )
            );
        }

        return result;
    }

    private AdminMediaFileResponse mapFile(
            StoredLegendImage file,
            Map<
                    String,
                    List<AdminMediaLegendReferenceResponse>
                    > usagesByFilename
    ) {
        List<AdminMediaLegendReferenceResponse> usages =
                usagesByFilename.getOrDefault(
                        file.filename(),
                        List.of()
                );

        return new AdminMediaFileResponse(
                file.filename(),
                file.url(),
                file.contentType(),
                file.sizeBytes(),
                file.lastModified(),
                usages.isEmpty(),
                usages
        );
    }
}