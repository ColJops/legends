package com.example.backend.service;

import com.example.backend.dto.auth.AccountSettingsResponse;
import com.example.backend.dto.auth.AuthResponse;
import com.example.backend.dto.auth.LoginRequest;
import com.example.backend.dto.auth.RegisterRequest;
import com.example.backend.dto.auth.UpdateProfileVisibilityRequest;
import com.example.backend.dto.community.PublicUserProfileResponse;
import com.example.backend.entity.Legend;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.exception.UserAccountUnavailableException;
import com.example.backend.repository.LegendCommentRepository;
import com.example.backend.repository.LegendRatingRepository;
import com.example.backend.repository.LegendRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

    @Mock
    private LegendService legendService;

    @Mock
    private LegendRepository legendRepository;

    @Mock
    private LegendCommentRepository legendCommentRepository;

    @Mock
    private LegendRatingRepository legendRatingRepository;

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
                    user.setId(uuid(10));
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

    @Test
    void updateProfileVisibilitySavesFlagAndTrimmedAvatar() {
        User user = user(true, false);
        when(userRepository.findByUsername("new-user")).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        AccountSettingsResponse response = userService.updateProfileVisibility(
                "new-user",
                new UpdateProfileVisibilityRequest(true, "  /uploads/legends/avatar.png  ")
        );

        assertThat(response.publicProfile()).isTrue();
        assertThat(response.avatarUrl()).isEqualTo("/uploads/legends/avatar.png");
    }

    @Test
    @SuppressWarnings("unchecked")
    void getPublicProfileExposesFullDetailsWhenPublicAndHidesThemWhenPrivate() {
        User user = user(true, false);
        user.setCreatedAt(LocalDateTime.of(2026, 5, 10, 12, 0));
        user.setAvatarUrl("/uploads/legends/avatar.png");

        when(userRepository.findByUsername("new-user")).thenReturn(Optional.of(user));
        when(legendRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.<Legend>of()));
        when(legendCommentRepository.countByAuthor_Id(user.getId())).thenReturn(3L);
        when(legendRatingRepository.countByUser_Id(user.getId())).thenReturn(7L);

        // 1. Profil prywatny -> brak avatara, stażu i roli, ale widoczna aktywność
        user.setPublicProfile(false);
        PublicUserProfileResponse privateProfile = userService.getPublicProfile("new-user");
        assertThat(privateProfile.username()).isEqualTo("new-user");
        assertThat(privateProfile.publicProfile()).isFalse();
        assertThat(privateProfile.avatarUrl()).isNull();
        assertThat(privateProfile.joinedAt()).isNull();
        assertThat(privateProfile.role()).isNull();
        assertThat(privateProfile.commentsCount()).isEqualTo(3L);
        assertThat(privateProfile.ratingsGivenCount()).isEqualTo(7L);

        // 2. Profil publiczny -> wszystkie dane widoczne
        user.setPublicProfile(true);
        PublicUserProfileResponse publicProfile = userService.getPublicProfile("new-user");
        assertThat(publicProfile.publicProfile()).isTrue();
        assertThat(publicProfile.avatarUrl()).isEqualTo("/uploads/legends/avatar.png");
        assertThat(publicProfile.joinedAt()).isEqualTo(LocalDateTime.of(2026, 5, 10, 12, 0));
        assertThat(publicProfile.role()).isEqualTo("USER");
    }

    private User user(boolean enabled, boolean locked) {
        return User.builder()
                .id(uuid(10))
                .username("new-user")
                .email("new@example.com")
                .password("encoded-password")
                .role(Role.USER)
                .enabled(enabled)
                .locked(locked)
                .build();
    }

    private static UUID uuid(long value) {
        return UUID.fromString(String.format("00000000-0000-0000-0000-%012d", value));
    }
}