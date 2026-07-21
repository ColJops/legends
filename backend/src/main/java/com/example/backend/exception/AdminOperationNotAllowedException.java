package com.example.backend.exception;

public class AdminOperationNotAllowedException
        extends RuntimeException {

    public AdminOperationNotAllowedException(
            String message
    ) {
        super(message);
    }
}