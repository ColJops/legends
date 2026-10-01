package com.example.backend.service;

import com.example.backend.dto.PagedResponse;
import com.example.backend.dto.admin.AdminLegendListItemResponse;
import com.example.backend.entity.AdminAuditAction;
import com.example.backend.entity.AdminAuditTargetType;
import com.example.backend.entity.Legend;
import com.example.backend.exception.LegendNotFoundException;
import com.example.backend.repository.LegendRepository;
import com.example.backend.specification.LegendSpecification;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminLegendService {

    private final LegendRepository legendRepository;
    private final LegendService legendService;
    private final AdminAuditService adminAuditService;

    @Transactional(readOnly = true)
    public PagedResponse<AdminLegendListItemResponse> findAll(
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

        Specification<Legend> specification = Specification
                .where(
                        LegendSpecification.containsAdminText(search)
                )
                .and(LegendSpecification.hasCity(city))
                .and(LegendSpecification.hasRegion(region))
                .and(LegendSpecification.hasCategory(category));

        Page<AdminLegendListItemResponse> result =
                legendRepository
                        .findAll(specification, pageable)
                        .map(this::mapToListItem);

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

    @Transactional
    public void delete(Long id) {
        /*
         * LegendService obsługuje:
         * - sprawdzenie istnienia legendy,
         * - uprawnienia administratora,
         * - usunięcie rekordu,
         * - usunięcie przypisanego obrazu.
         */
        Legend legend = legendRepository.findById(id)
                .orElseThrow(() ->
                        new LegendNotFoundException(id)
                );
        String legendTitle = legend.getTitle();
        legendService.delete(id);

        adminAuditService.record(
                AdminAuditAction.LEGEND_DELETED,
                AdminAuditTargetType.LEGEND,
                id,
                legendTitle,
                "Legenda została usunięta przez administratora"
        );
    }

    private AdminLegendListItemResponse mapToListItem(Legend legend) {
        return new AdminLegendListItemResponse(
                legend.getId(),
                legend.getTitle(),
                legend.getRegion(),
                legend.getCity(),
                legend.getCategory(),
                legend.getImageUrl(),
                legend.getCreatedAt(),
                legend.getUpdatedAt(),
                legend.getAuthor() != null
                        ? legend.getAuthor().getId()
                        : null,
                legend.getAuthor() != null
                        ? legend.getAuthor().getUsername()
                        : null
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
            case "id",
                 "title",
                 "city",
                 "region",
                 "category",
                 "createdAt",
                 "updatedAt" -> sortBy;

            default -> "createdAt";
        };

        Sort.Direction safeDirection =
                "asc".equalsIgnoreCase(direction)
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;

        return Sort.by(safeDirection, safeSortBy);
    }
}