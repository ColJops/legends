package com.example.backend.controller;

import com.example.backend.dto.LegendRequest;
import com.example.backend.dto.LegendResponse;
import com.example.backend.service.LegendService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/legends")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class LegendController {

    private final LegendService legendService;

    @GetMapping
    public List<LegendResponse> getAllLegends() {
        return legendService.findAll();
    }

    @GetMapping("/{id}")
    public LegendResponse getLegendById(@PathVariable Long id) {
        return legendService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LegendResponse createLegend(@Valid @RequestBody LegendRequest request) {
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
}
