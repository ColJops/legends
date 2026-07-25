package com.example.backend.exception;

public class UserAccountUnavailableException
        extends RuntimeException {

    public UserAccountUnavailableException() {
        super("Konto jest zablokowane lub wyłączone");
    }
}