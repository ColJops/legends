package com.example.backend.controller;

import com.example.backend.dto.LegendRequest;
import com.example.backend.dto.LegendResponse;
import com.example.backend.dto.LegendStatsResponse;
import com.example.backend.dto.PagedResponse;
import com.example.backend.service.LegendService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Validated
@RestController
@RequestMapping("/api/legends")
@RequiredArgsConstructor
public class LegendController {

    private final LegendService legendService;

    @GetMapping
    public PagedResponse<LegendResponse> getAllLegends(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "6") @Min(1) @Max(50) int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        return legendService.findAllPaged(
                search,
                city,
                region,
                category,
                page,
                size,
                sortBy,
                direction
        );
    }

    @GetMapping("/{id}")
    public LegendResponse getLegendById(@PathVariable Long id) {
        return legendService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LegendResponse createLegend(
            @Valid @RequestBody LegendRequest request
    ) {
        return legendService.create(request);
    }

    @PutMapping("/{id}")
    public LegendResponse updateLegend(
            @PathVariable Long id,
            @Valid @RequestBody LegendRequest request
    ) {
        return legendService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLegend(@PathVariable Long id) {
        legendService.delete(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/images/orphans")
    public Map<String, Integer> cleanupOrphanedImages() {
        int deletedFiles = legendService.cleanupOrphanedImages();

        return Map.of("deletedFiles", deletedFiles);
    }

    @GetMapping("/stats")
    public LegendStatsResponse getLegendStats() {
        return legendService.getStats();
    }
}
