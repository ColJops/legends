package com.example.backend.exception;

public class LegendAccessDeniedException extends RuntimeException {

    public LegendAccessDeniedException() {
        super("Nie masz uprawnień do modyfikacji tej legendy.");
    }
}