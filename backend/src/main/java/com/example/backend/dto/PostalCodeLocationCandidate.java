package com.example.backend.dto;

import com.example.backend.entity.Region;

public record PostalCodeLocationCandidate(String city, Region region) {
}
