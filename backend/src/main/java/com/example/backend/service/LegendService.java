package com.example.backend.service;

import com.example.backend.dto.LegendRequest;
import com.example.backend.dto.LegendResponse;
import com.example.backend.dto.PagedResponse;
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
import com.example.backend.exception.InvalidCityForRegionException;
import com.example.backend.validation.CityValidator;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LegendService {

    private final LegendRepository legendRepository;

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
        Legend legend = Legend.builder()
                .title(request.title())
                .content(request.content())
                .region(request.region())
                .city(request.city())
                .category(request.category())
                .imageUrl(request.imageUrl())
                .build();

        Legend savedLegend = legendRepository.save(legend);

        return mapToResponse(savedLegend);
    }

    public LegendResponse update(Long id, LegendRequest request) {
        Legend legend = legendRepository.findById(id)
                .orElseThrow(() -> new LegendNotFoundException(id));

        validateCityForRegion(request);

        legend.setTitle(request.title());
        legend.setContent(request.content());
        legend.setRegion(request.region());
        legend.setCity(request.city());
        legend.setCategory(request.category());
        legend.setImageUrl(request.imageUrl());

        Legend updatedLegend = legendRepository.save(legend);

        return mapToResponse(updatedLegend);
    }

    public void delete(Long id) {
        if (!legendRepository.existsById(id)) {
            throw new LegendNotFoundException(id);
        }

        legendRepository.deleteById(id);
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
                legend.getUpdatedAt()
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
        return Math.min(Math.max(size, 1), 50);
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
}
