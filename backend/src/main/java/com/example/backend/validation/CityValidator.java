package com.example.backend.validation;

import com.example.backend.entity.Region;

public final class CityValidator {

    private CityValidator() {
    }

    public static boolean isValid(Region region, String city) {
        return region != null && city != null && !city.isBlank();
    }
}
