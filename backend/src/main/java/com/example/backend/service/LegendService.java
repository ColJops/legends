package com.example.backend.service;

import com.example.backend.dto.LegendRequest;
import com.example.backend.dto.LegendResponse;
import com.example.backend.dto.PagedResponse;
import com.example.backend.dto.LegendStatsResponse;
import com.example.backend.entity.*;
import com.example.backend.exception.LegendNotFoundException;
import com.example.backend.repository.LegendRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.specification.LegendSpecification;
import com.example.backend.upload.FileUploadService;
import com.example.backend.exception.InvalidCityForRegionException;
import com.example.backend.validation.CityValidator;
import com.example.backend.exception.LegendAccessDeniedException;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LegendService {

    private final LegendRepository legendRepository;
    private final FileUploadService fileUploadService;
    private final UserRepository userRepository;
    private final AdminAuditService adminAuditService;

    private void validateCityForRegion(LegendRequest request) {
        if (!CityValidator.isValid(request.region(), request.city())) {
            throw new InvalidCityForRegionException(request.region(), request.city());
        }
    }

    public List<LegendResponse> findAll() {
        return legendRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public LegendResponse findById(Long id) {
        Legend legend = legendRepository.findById(id)
                .orElseThrow(() -> new LegendNotFoundException(id));

        return mapToResponse(legend);
    }

    public LegendResponse create(LegendRequest request) {
        validateCityForRegion(request);
        User author = getCurrentUser();
        Legend legend = Legend.builder()
                .title(request.title())
                .content(request.content())
                .region(request.region())
                .city(request.city())
                .category(request.category())
                .imageUrl(request.imageUrl())
                .author(author)
                .build();

        Legend savedLegend = legendRepository.save(legend);

        return mapToResponse(savedLegend);
    }

    @Transactional
    public LegendResponse update(
            Long id,
            LegendRequest request
    ) {
        Legend legend = legendRepository.findById(id)
                .orElseThrow(
                        () -> new LegendNotFoundException(id)
                );

        User currentUser = getCurrentUser();

        verifyOwnership(legend);
        validateCityForRegion(request);

        legend.setTitle(request.title());
        legend.setContent(request.content());
        legend.setRegion(request.region());
        legend.setCity(request.city());
        legend.setCategory(request.category());
        legend.setImageUrl(request.imageUrl());

        Legend updatedLegend =
                legendRepository.save(legend);

        if (currentUser.getRole() == Role.ADMIN) {
            adminAuditService.record(
                    AdminAuditAction.LEGEND_UPDATED,
                    AdminAuditTargetType.LEGEND,
                    updatedLegend.getId(),
                    updatedLegend.getTitle(),
                    "Legenda została zmodyfikowana przez administratora"
            );
        }

        return mapToResponse(updatedLegend);
    }

    public void delete(Long id) {
        Legend legend = legendRepository.findById(id)
                .orElseThrow(() -> new LegendNotFoundException(id));

        verifyOwnership(legend);

        String imageUrl = legend.getImageUrl();

        legendRepository.delete(legend);

        fileUploadService.deleteLegendImage(imageUrl);
    }

    private LegendResponse mapToResponse(Legend legend) {
        return new LegendResponse(
                legend.getId(),
                legend.getTitle(),
                legend.getContent(),
                legend.getRegion(),
                legend.getCity(),
                legend.getCategory(),
                legend.getImageUrl(),
                legend.getCreatedAt(),
                legend.getUpdatedAt(),
                legend.getAuthor() != null ? legend.getAuthor().getId() : null,
                legend.getAuthor() != null ? legend.getAuthor().getUsername() : null
        );
    }

    public PagedResponse<LegendResponse> findAllPaged(
            String search,
            String city,
            String region,
            String category,
            int page,
            int size,
            String sortBy,
            String direction
    ) {
        Pageable pageable = PageRequest.of(
                clampPage(page),
                clampSize(size),
                buildSort(sortBy, direction)
        );

        Specification<Legend> spec = Specification
                .where(LegendSpecification.containsText(search))
                .and(LegendSpecification.hasCity(city))
                .and(LegendSpecification.hasRegion(region))
                .and(LegendSpecification.hasCategory(category));

        Page<LegendResponse> result = legendRepository.findAll(spec, pageable)
                .map(this::mapToResponse);

        return new PagedResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isFirst(),
                result.isLast()
        );
    }

    private int clampPage(int page) {
        return Math.max(page, 0);
    }

    private int clampSize(int size) {
        return Math.clamp(size, 1, 50);
    }

    private Sort buildSort(String sortBy, String direction) {
        String safeSortBy = switch (sortBy) {
            case "title", "city", "region", "category", "createdAt", "updatedAt" -> sortBy;
            default -> "createdAt";
        };

        Sort.Direction safeDirection = "asc".equalsIgnoreCase(direction)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        return Sort.by(safeDirection, safeSortBy);
    }

    public LegendStatsResponse getStats() {

        Map<String, Long> byCategory = new LinkedHashMap<>();

        legendRepository.countByCategory()
                .forEach(row -> byCategory.put(
                        row[0].toString(),
                        (long) row[1]
                ));

        Map<String, Long> byRegion = new LinkedHashMap<>();

        legendRepository.countByRegion()
                .forEach(row -> byRegion.put(
                        row[0].toString(),
                        (long) row[1]
                ));

        return new LegendStatsResponse(
                legendRepository.count(),
                byCategory,
                byRegion
        );
    }

    public Integer cleanupOrphanedImages() {
        List<String> usedImageUrls = legendRepository.findAllImageUrls();

        return fileUploadService.cleanupOrphanedLegendImages(usedImageUrls);
    }

    private User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User is not authenticated");
        }

        String username = authentication.getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }

    private void verifyOwnership(Legend legend) {
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == Role.ADMIN) {
            return;
        }

        if (legend.getAuthor() == null) {
            throw new LegendAccessDeniedException();
        }

        if (!legend.getAuthor().getId().equals(currentUser.getId())) {
            throw new LegendAccessDeniedException();
        }
    }
}
