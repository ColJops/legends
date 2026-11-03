package com.example.backend.exception;

import com.example.backend.entity.Region;

public class InvalidCityForRegionException extends RuntimeException {

    public InvalidCityForRegionException(Region region, String city) {
        super("Miasto i województwo muszą być podane.");
    }
}