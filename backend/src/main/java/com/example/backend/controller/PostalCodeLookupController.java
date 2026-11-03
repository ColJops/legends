package com.example.backend.controller;

import com.example.backend.dto.PostalCodeLookupResponse;
import com.example.backend.service.PostalCodeLookupService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/postal-codes")
@RequiredArgsConstructor
public class PostalCodeLookupController {

    private final PostalCodeLookupService postalCodeLookupService;

    @GetMapping("/{code}")
    public PostalCodeLookupResponse lookup(@PathVariable String code) {
        return postalCodeLookupService.lookup(code);
    }
}
