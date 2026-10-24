package com.example.backend.exception;

import java.util.UUID;

public class LegendNotFoundException extends RuntimeException {

    public LegendNotFoundException(UUID id) {
        super("Legend not found with id: " + id);
    }
}
