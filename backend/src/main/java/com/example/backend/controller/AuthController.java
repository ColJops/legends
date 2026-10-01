package com.example.backend.controller;

import com.example.backend.dto.auth.AuthResponse;
import com.example.backend.dto.auth.LoginRequest;
import com.example.backend.dto.auth.MessageResponse;
import com.example.backend.dto.auth.RegisterRequest;
import com.example.backend.dto.auth.ResendVerificationRequest;
import com.example.backend.service.EmailVerificationService;
import com.example.backend.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final EmailVerificationService emailVerificationService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        userService.register(request);

        AuthResponse response = new AuthResponse(
                "Registration successful. Check your email to activate the account",
                request.username(),
                "USER",
                null
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request
    ) {
        return userService.login(request);
    }

    @GetMapping("/verify-email")
    public MessageResponse verifyEmail(
            @RequestParam
            @NotBlank
            String token
    ) {
        emailVerificationService.verify(token);
        return new MessageResponse(
                "Adres e-mail został potwierdzony. Możesz się zalogować"
        );
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<MessageResponse> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request
    ) {
        emailVerificationService.resend(request.email());

        return ResponseEntity.accepted().body(
                new MessageResponse(
                        "Jeżeli konto istnieje i oczekuje na aktywację, wysłaliśmy nową wiadomość"
                )
        );
    }

    @GetMapping("/me")
    public AuthResponse me(Authentication authentication) {
        return new AuthResponse(
                "Authenticated user",
                authentication.getName(),
                authentication.getAuthorities().toString(),
                null
        );
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String admin() {
        return "ADMIN OK";
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('USER')")
    public String user() {
        return "USER OK";
    }
}
