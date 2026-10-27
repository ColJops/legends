package com.example.backend.exception;

public class CurrentPasswordMismatchException extends RuntimeException {

    public CurrentPasswordMismatchException() {
        super("Obecne hasło jest nieprawidłowe");
    }
}
