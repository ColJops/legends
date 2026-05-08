package com.example.backend.exception;

public class LegendNotFoundException extends RuntimeException {

    public LegendNotFoundException(Long id) {
        super("Legend not found with id: " + id);
    }
}
