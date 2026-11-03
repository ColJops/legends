package com.example.backend.dto;

import java.util.List;

public record PostalCodeLookupResponse(
        String postalCode,
        List<PostalCodeLocationCandidate> candidates
) {
}
