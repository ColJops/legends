package com.example.backend.service;

import com.example.backend.dto.auth.AuthResponse;
import com.example.backend.dto.auth.LoginRequest;
import com.example.backend.dto.auth.RegisterRequest;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.exception.UserAccountUnavailableException;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
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

    @Mock
    private EmailVerificationService emailVerificationService;

    @InjectMocks
    private UserService userService;

    @Test
    void registerCreatesDisabledAccountAndIssuesVerificationToken() {
        RegisterRequest request = new RegisterRequest(
                "new-user",
                "NEW@Example.com",
                "password123"
        );
        when(passwordEncoder.encode("password123"))
                .thenReturn("encoded-password");
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> {
                    User user = invocation.getArgument(0);
                    user.setId(10L);
                    return user;
                });

        userService.register(request);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();

        assertThat(saved.getUsername()).isEqualTo("new-user");
        assertThat(saved.getEmail()).isEqualTo("new@example.com");
        assertThat(saved.getRole()).isEqualTo(Role.USER);
        assertThat(saved.isEnabled()).isFalse();
        assertThat(saved.isLocked()).isFalse();
        assertThat(saved.getPassword()).isEqualTo("encoded-password");
        verify(emailVerificationService).issueToken(saved);
    }

    @Test
    void loginRejectsAccountWaitingForVerification() {
        User user = user(false, false);
        when(userRepository.findByUsername("new-user"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "encoded-password"))
                .thenReturn(true);

        assertThatThrownBy(() -> userService.login(
                new LoginRequest("new-user", "password123")
        )).isInstanceOf(UserAccountUnavailableException.class);
    }

    @Test
    void loginReturnsJwtForVerifiedAccount() {
        User user = user(true, false);
        when(userRepository.findByUsername("new-user"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "encoded-password"))
                .thenReturn(true);
        when(jwtService.generateToken("new-user"))
                .thenReturn("jwt-token");

        AuthResponse response = userService.login(
                new LoginRequest("new-user", "password123")
        );

        assertThat(response.username()).isEqualTo("new-user");
        assertThat(response.role()).isEqualTo("USER");
        assertThat(response.token()).isEqualTo("jwt-token");
    }

    private User user(boolean enabled, boolean locked) {
        return User.builder()
                .id(10L)
                .username("new-user")
                .email("new@example.com")
                .password("encoded-password")
                .role(Role.USER)
                .enabled(enabled)
                .locked(locked)
                .build();
    }
}
