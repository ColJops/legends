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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private UserService userService;

    @Test
    void registerEncodesPasswordAndCreatesEnabledUnlockedUser() {
        RegisterRequest request = new RegisterRequest(
                "ania",
                "ania@example.com",
                "password123"
        );
        when(userRepository.existsByUsername("ania")).thenReturn(false);
        when(userRepository.existsByEmail("ania@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed-password");

        userService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue())
                .extracting(
                        User::getUsername,
                        User::getEmail,
                        User::getPassword,
                        User::getRole,
                        User::isEnabled,
                        User::isLocked
                )
                .containsExactly(
                        "ania",
                        "ania@example.com",
                        "hashed-password",
                        Role.USER,
                        true,
                        false
                );
    }

    @Test
    void registerRejectsDuplicateUsernameBeforeEncodingPassword() {
        RegisterRequest request = new RegisterRequest(
                "ania",
                "ania@example.com",
                "password123"
        );
        when(userRepository.existsByUsername("ania")).thenReturn(true);

        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessage("Username is already in use");

        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void loginReturnsJwtForActiveUser() {
        User user = activeUser();
        when(userRepository.findByUsername("ania")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed-password")).thenReturn(true);
        when(jwtService.generateToken("ania")).thenReturn("jwt-token");

        AuthResponse response = userService.login(
                new LoginRequest("ania", "password123")
        );

        assertThat(response.username()).isEqualTo("ania");
        assertThat(response.role()).isEqualTo("USER");
        assertThat(response.token()).isEqualTo("jwt-token");
    }

    @Test
    void loginRejectsInvalidPassword() {
        User user = activeUser();
        when(userRepository.findByUsername("ania")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "hashed-password")).thenReturn(false);

        assertThatThrownBy(() ->
                userService.login(new LoginRequest("ania", "wrong-password"))
        ).isInstanceOf(InvalidCredentialsException.class);

        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void loginRejectsLockedUserWithoutIssuingToken() {
        User user = activeUser();
        user.setLocked(true);
        when(userRepository.findByUsername("ania")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed-password")).thenReturn(true);

        assertThatThrownBy(() ->
                userService.login(new LoginRequest("ania", "password123"))
        ).isInstanceOf(UserAccountUnavailableException.class);

        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void loginRejectsDisabledUserWithoutIssuingToken() {
        User user = activeUser();
        user.setEnabled(false);
        when(userRepository.findByUsername("ania")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed-password")).thenReturn(true);

        assertThatThrownBy(() ->
                userService.login(new LoginRequest("ania", "password123"))
        ).isInstanceOf(UserAccountUnavailableException.class);

        verify(jwtService, never()).generateToken(any());
    }

    private User activeUser() {
        return User.builder()
                .id(10L)
                .username("ania")
                .email("ania@example.com")
                .password("hashed-password")
                .role(Role.USER)
                .enabled(true)
                .locked(false)
                .createdAt(LocalDateTime.of(2026, 1, 1, 10, 0))
                .build();
    }
}
