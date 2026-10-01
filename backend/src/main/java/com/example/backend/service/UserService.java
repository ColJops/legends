package com.example.backend.service;

import com.example.backend.dto.auth.AuthResponse;
import com.example.backend.dto.auth.LoginRequest;
import com.example.backend.dto.auth.RegisterRequest;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.exception.InvalidCredentialsException;
import com.example.backend.exception.UserAccountUnavailableException;
import com.example.backend.exception.UserAlreadyExistsException;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailVerificationService emailVerificationService;

    @Transactional
    public void register(RegisterRequest request) {
        String username = request.username().trim();
        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByUsername(username)) {
            throw new UserAlreadyExistsException(
                    "Username is already in use"
            );
        }
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException(
                    "Email is already in use"
            );
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .enabled(false)
                .locked(false)
                .build();

        User savedUser = userRepository.save(user);
        emailVerificationService.issueToken(savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(
                request.password(),
                user.getPassword()
        )) {
            throw new InvalidCredentialsException();
        }

        if (!user.isEnabled() || user.isLocked()) {
            throw new UserAccountUnavailableException();
        }

        String token = jwtService.generateToken(user.getUsername());

        return new AuthResponse(
                "Login successful",
                user.getUsername(),
                user.getRole().name(),
                token
        );
    }
}
