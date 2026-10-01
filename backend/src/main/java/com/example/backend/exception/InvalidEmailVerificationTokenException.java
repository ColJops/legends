package com.example.backend.exception;

public class InvalidEmailVerificationTokenException
        extends RuntimeException {

    public InvalidEmailVerificationTokenException() {
        super("Token weryfikacyjny jest nieprawidłowy lub wygasł");
    }
}
