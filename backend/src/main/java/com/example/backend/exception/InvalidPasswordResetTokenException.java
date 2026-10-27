package com.example.backend.exception;

public class InvalidPasswordResetTokenException extends RuntimeException {

    public InvalidPasswordResetTokenException() {
        super("Link resetowania hasła jest nieprawidłowy lub wygasł");
    }
}
