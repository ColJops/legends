package com.example.backend.service;

import com.example.backend.dto.PagedResponse;
import com.example.backend.dto.admin.AdminUserListItemResponse;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.exception.AdminOperationNotAllowedException;
import com.example.backend.exception.UserNotFoundException;
import com.example.backend.repository.LegendRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.specification.UserSpecification;
import com.example.backend.dto.admin.UserContentAction;
import com.example.backend.upload.FileUploadService;
import com.example.backend.entity.AdminAuditAction;
import com.example.backend.entity.AdminAuditTargetType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final LegendRepository legendRepository;
    private final FileUploadService fileUploadService;
    private final AdminAuditService adminAuditService;

    @Transactional(readOnly = true)
    public PagedResponse<AdminUserListItemResponse> findAll(
            String search,
            String role,
            Boolean enabled,
            Boolean locked,
            int page,
            int size,
            String sortBy,
            String direction
    ) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.clamp(size, 1, 50),
                buildSort(sortBy, direction)
        );

        Specification<User> specification =
                UserSpecification.containsText(search)
                        .and(UserSpecification.hasRole(role))
                        .and(
                                UserSpecification
                                        .hasEnabledStatus(enabled)
                        )
                        .and(
                                UserSpecification
                                        .hasLockedStatus(locked)
                        );

        Page<User> users =
                userRepository.findAll(
                        specification,
                        pageable
                );

        Map<Long, Long> legendCounts =
                getLegendCounts(users.getContent());

        Page<AdminUserListItemResponse> response =
                users.map(user ->
                        mapUser(
                                user,
                                legendCounts.getOrDefault(
                                        user.getId(),
                                        0L
                                )
                        )
                );

        return new PagedResponse<>(
                response.getContent(),
                response.getNumber(),
                response.getSize(),
                response.getTotalElements(),
                response.getTotalPages(),
                response.isFirst(),
                response.isLast()
        );
    }

    @Transactional
    public void updateRole(
            Long userId,
            Role newRole,
            String currentUsername
    ) {
        User target = findUser(userId);
        User currentAdmin = findUser(currentUsername);
        Role previousRole = target.getRole();

        if (target.getId().equals(currentAdmin.getId())) {
            throw new AdminOperationNotAllowedException(
                    "Nie możesz zmienić roli własnego konta"
            );
        }

        if (target.getRole() == newRole) {
            return;
        }

        if (
                target.getRole() == Role.ADMIN
                        && newRole == Role.USER
                        && userRepository.countByRole(Role.ADMIN) <= 1
        ) {
            throw new AdminOperationNotAllowedException(
                    "Nie można odebrać roli ostatniemu administratorowi"
            );
        }

        target.setRole(newRole);
        userRepository.save(target);
        adminAuditService.record(
                AdminAuditAction.USER_ROLE_CHANGED,
                AdminAuditTargetType.USER,
                target.getId(),
                target.getUsername(),
                "Zmiana roli z "
                        + previousRole
                        + " na "
                        + newRole
        );
    }

    @Transactional
    public void updateLock(
            Long userId,
            boolean locked,
            String currentUsername
    ) {
        User target = findUser(userId);
        User currentAdmin = findUser(currentUsername);

        if (
                target.getId().equals(currentAdmin.getId())
                        && locked
        ) {
            throw new AdminOperationNotAllowedException(
                    "Nie możesz zablokować własnego konta"
            );
        }

        if (target.isLocked() == locked) {
            return;
        }

        if (
                locked
                        && target.getRole() == Role.ADMIN
                        && target.isEnabled()
                        && !target.isLocked()
                        && userRepository
                        .countByRoleAndEnabledTrueAndLockedFalse(
                                Role.ADMIN
                        ) <= 1
        ) {
            throw new AdminOperationNotAllowedException(
                    "Nie można zablokować ostatniego aktywnego administratora"
            );
        }

        target.setLocked(locked);
        userRepository.save(target);
        adminAuditService.record(
                locked
                        ? AdminAuditAction.USER_LOCKED
                        : AdminAuditAction.USER_UNLOCKED,
                AdminAuditTargetType.USER,
                target.getId(),
                target.getUsername(),
                locked
                        ? "Konto użytkownika zostało zablokowane"
                        : "Konto użytkownika zostało odblokowane"
        );
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(
                        () -> new UserNotFoundException(id)
                );
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(
                        () ->
                                new AdminOperationNotAllowedException(
                                        "Nie znaleziono bieżącego administratora"
                                )
                );
    }

    private Map<Long, Long> getLegendCounts(
            List<User> users
    ) {
        if (users.isEmpty()) {
            return Collections.emptyMap();
        }

        List<Long> userIds = users.stream()
                .map(User::getId)
                .toList();

        return legendRepository.countByAuthorIds(userIds)
                .stream()
                .collect(
                        Collectors.toMap(
                                row -> (Long) row[0],
                                row -> (Long) row[1]
                        )
                );
    }

    private AdminUserListItemResponse mapUser(
            User user,
            long legendsCount
    ) {
        return new AdminUserListItemResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled(),
                user.isLocked(),
                user.getCreatedAt(),
                legendsCount
        );
    }

    private Sort buildSort(
            String sortBy,
            String direction
    ) {
        String safeSortBy = switch (sortBy) {
            case "id",
                 "username",
                 "email",
                 "role",
                 "enabled",
                 "locked",
                 "createdAt" -> sortBy;

            default -> "createdAt";
        };

        Sort.Direction safeDirection =
                "asc".equalsIgnoreCase(direction)
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;

        return Sort.by(
                safeDirection,
                safeSortBy
        );
    }

    @Transactional
    public void deleteUser(
            Long userId,
            UserContentAction contentAction,
            String currentUsername
    ) {
        User target = findUser(userId);
        User currentAdmin = findUser(currentUsername);
        Long deletedUserId = target.getId();
        String deletedUsername = target.getUsername();

        if (target.getId().equals(currentAdmin.getId())) {
            throw new AdminOperationNotAllowedException(
                    "Nie możesz usunąć własnego konta"
            );
        }

        if (
                target.getRole() == Role.ADMIN
                        && userRepository.countByRole(Role.ADMIN) <= 1
        ) {
            throw new AdminOperationNotAllowedException(
                    "Nie można usunąć ostatniego administratora"
            );
        }

        UserContentAction safeAction =
                contentAction == null
                        ? UserContentAction.ANONYMIZE
                        : contentAction;

        if (safeAction == UserContentAction.DELETE) {
            deleteUserWithContent(target);
        } else {
            anonymizeUserContent(target);
        }

        userRepository.delete(target);
        adminAuditService.record(
                AdminAuditAction.USER_DELETED,
                AdminAuditTargetType.USER,
                deletedUserId,
                deletedUsername,
                "Usunięto użytkownika. Operacja na treściach: "
                        + safeAction
        );
    }

    private void anonymizeUserContent(User user) {
        legendRepository.anonymizeByAuthorId(user.getId());
    }

    private void deleteUserWithContent(User user) {
        List<String> imageUrls = new ArrayList<>(
                legendRepository.findImageUrlsByAuthorId(
                        user.getId()
                )
        );

        legendRepository.deleteByAuthorId(user.getId());

        deleteImagesAfterCommit(imageUrls);
    }

    private void deleteImagesAfterCommit(
            List<String> imageUrls
    ) {
        if (imageUrls.isEmpty()) {
            return;
        }

        TransactionSynchronizationManager
                .registerSynchronization(
                        new TransactionSynchronization() {
                            @Override
                            public void afterCommit() {
                                imageUrls.forEach(
                                        fileUploadService
                                                ::deleteLegendImage
                                );
                            }
                        }
                );
    }

}