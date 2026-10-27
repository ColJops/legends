package com.example.backend.exception;

import java.util.UUID;

public class UserNotFoundException
        extends RuntimeException {

    public UserNotFoundException(UUID id) {
        super("Nie znaleziono użytkownika o ID: " + id);
    }

    public UserNotFoundException(String username) {
        super("Nie znaleziono użytkownika o nazwie: " + username);
    }
}
