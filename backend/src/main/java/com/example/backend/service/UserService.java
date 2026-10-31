package com.example.backend.service;

import com.example.backend.dto.LegendResponse;
import com.example.backend.dto.auth.AuthResponse;
import com.example.backend.dto.auth.AccountSettingsResponse;
import com.example.backend.dto.auth.ChangePasswordRequest;
import com.example.backend.dto.auth.LoginRequest;
import com.example.backend.dto.auth.RegisterRequest;
import com.example.backend.dto.community.PublicUserProfileResponse;
import com.example.backend.entity.LegendStatus;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.exception.InvalidCredentialsException;
import com.example.backend.exception.CurrentPasswordMismatchException;
import com.example.backend.exception.UserAccountUnavailableException;
import com.example.backend.exception.UserAlreadyExistsException;
import com.example.backend.exception.UserNotFoundException;
import com.example.backend.repository.*;
import com.example.backend.specification.LegendSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailVerificationService emailVerificationService;
    private final LegendService legendService;
    private final LegendRepository legendRepository;
    private final LegendCommentRepository legendCommentRepository;
    private final LegendRatingRepository legendRatingRepository;

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

    @Transactional(readOnly = true)
    public AccountSettingsResponse getAccountSettings(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));

        return new AccountSettingsResponse(
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getCreatedAt(),
                user.isPublicProfile(),
                user.getAvatarUrl()
        );
    }

    @Transactional
    public AccountSettingsResponse updateProfileVisibility(
            String username,
            com.example.backend.dto.auth.UpdateProfileVisibilityRequest request
    ) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));

        user.setPublicProfile(Boolean.TRUE.equals(request.publicProfile()));
        String cleanedAvatar = request.avatarUrl() == null || request.avatarUrl().isBlank()
                ? null
                : request.avatarUrl().trim();
        user.setAvatarUrl(cleanedAvatar);

        User saved = userRepository.save(user);

        return new AccountSettingsResponse(
                saved.getUsername(),
                saved.getEmail(),
                saved.getRole().name(),
                saved.getCreatedAt(),
                saved.isPublicProfile(),
                saved.getAvatarUrl()
        );
    }

    @Transactional
    public void changePassword(
            String username,
            ChangePasswordRequest request
    ) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));

        if (!passwordEncoder.matches(
                request.currentPassword(),
                user.getPassword()
        )) {
            throw new CurrentPasswordMismatchException();
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public PublicUserProfileResponse getPublicProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));


        Page<LegendResponse> publishedPage = legendRepository.findAll(
                Specification.where(LegendSpecification.hasAuthorId(user.getId()))
                        .and(LegendSpecification.hasStatus(LegendStatus.PUBLISHED)),
                PageRequest.of(0, 12, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).map(legendService::mapToResponse);

        long legendsCount = publishedPage.getTotalElements();
        List<LegendResponse> publishedLegends = publishedPage.getContent();
        long commentsCount = legendCommentRepository.countByAuthor_Id(user.getId());
        long ratingsCount = legendRatingRepository.countByUser_Id(user.getId());

        if (user.isPublicProfile()) {
            return new PublicUserProfileResponse(
                    user.getUsername(),
                    true,
                    user.getAvatarUrl(),
                    user.getCreatedAt(),
                    user.getRole().name(),
                    legendsCount,
                    commentsCount,
                    ratingsCount,
                    publishedLegends
            );
        }

        // Profil prywatny: tylko nazwa użytkownika i jego aktywność
        return new PublicUserProfileResponse(
                user.getUsername(),
                false,
                null,
                null,
                null,
                legendsCount,
                commentsCount,
                ratingsCount,
                publishedLegends
        );
    }
}
