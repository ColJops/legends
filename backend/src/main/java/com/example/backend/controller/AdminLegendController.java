package com.example.backend.controller;

import com.example.backend.dto.PagedResponse;
import com.example.backend.dto.admin.AdminLegendListItemResponse;
import com.example.backend.service.AdminLegendService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequestMapping("/api/admin/legends")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminLegendController {

    private final AdminLegendService adminLegendService;

    @GetMapping
    public PagedResponse<AdminLegendListItemResponse> getLegends(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0")
            @Min(0)
            int page,
            @RequestParam(defaultValue = "10")
            @Min(1)
            @Max(50)
            int size,
            @RequestParam(defaultValue = "createdAt")
            String sortBy,
            @RequestParam(defaultValue = "desc")
            String direction
    ) {
        return adminLegendService.findAll(
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

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLegend(@PathVariable Long id) {
        adminLegendService.delete(id);
    }
}