package com.example.backend.exception;

public class MediaFileNotFoundException
        extends RuntimeException {

    public MediaFileNotFoundException(
            String filename
    ) {
        super(
                "Nie znaleziono pliku obrazu: "
                        + filename
        );
    }
}