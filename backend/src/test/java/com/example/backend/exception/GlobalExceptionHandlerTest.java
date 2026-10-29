package com.example.backend.exception;

import com.example.backend.entity.Region;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
        request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/test");
    }

    @Test
    void mapsDomainExceptionsToExpectedStatusCodes() {
        UUID id = UUID.randomUUID();

        ApiError notFound = handler.handleLegendNotFound(new LegendNotFoundException(id), request);
        assertThat(notFound.status()).isEqualTo(HttpStatus.NOT_FOUND.value());

        ApiError invalidCity = handler.handleInvalidCityForRegion(
                new InvalidCityForRegionException(Region.POMORSKIE, "Kraków"), request
        );
        assertThat(invalidCity.status()).isEqualTo(HttpStatus.BAD_REQUEST.value());

        ApiError forbidden = handler.handleLegendAccessDenied(new LegendAccessDeniedException(), request);
        assertThat(forbidden.status()).isEqualTo(HttpStatus.FORBIDDEN.value());

        ApiError conflict = handler.handleAdminOperationNotAllowed(
                new AdminOperationNotAllowedException("Blokada niedozwolona"), request
        );
        assertThat(conflict.status()).isEqualTo(HttpStatus.CONFLICT.value());

        ApiError unauthorized = handler.handleInvalidCredentials(new InvalidCredentialsException(), request);
        assertThat(unauthorized.status()).isEqualTo(HttpStatus.UNAUTHORIZED.value());

        ApiError passwordMismatch = handler.handleCurrentPasswordMismatch(
                new CurrentPasswordMismatchException(), request
        );
        assertThat(passwordMismatch.status()).isEqualTo(HttpStatus.BAD_REQUEST.value());
    }
}
