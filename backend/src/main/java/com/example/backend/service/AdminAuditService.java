package com.example.backend.service;

import com.example.backend.dto.PagedResponse;
import com.example.backend.dto.admin.AdminAuditLogResponse;
import com.example.backend.entity.*;
import com.example.backend.exception.AdminOperationNotAllowedException;
import com.example.backend.repository.AdminAuditLogRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.specification.AdminAuditLogSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminAuditService {

    private final AdminAuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public void record(
            AdminAuditAction action,
            AdminAuditTargetType targetType,
            Long targetId,
            String targetLabel,
            String details
    ) {
        User administrator = getCurrentAdministrator();

        AdminAuditLog log = AdminAuditLog.builder()
                .adminId(administrator.getId())
                .adminUsername(administrator.getUsername())
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .targetLabel(trimToLength(targetLabel, 255))
                .details(trimToLength(details, 2000))
                .build();

        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public PagedResponse<AdminAuditLogResponse> findAll(
            String search,
            AdminAuditAction action,
            AdminAuditTargetType targetType,
            int page,
            int size,
            String direction
    ) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.clamp(size, 1, 100),
                buildSort(direction)
        );

        Specification<AdminAuditLog> specification =
                AdminAuditLogSpecification
                        .containsText(search)
                        .and(
                                AdminAuditLogSpecification
                                        .hasAction(action)
                        )
                        .and(
                                AdminAuditLogSpecification
                                        .hasTargetType(targetType)
                        );

        Page<AdminAuditLogResponse> result =
                auditLogRepository
                        .findAll(specification, pageable)
                        .map(this::mapResponse);

        return new PagedResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isFirst(),
                result.isLast()
        );
    }

    private User getCurrentAdministrator() {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (
                authentication == null
                        || !authentication.isAuthenticated()
        ) {
            throw new AdminOperationNotAllowedException(
                    "Nie można ustalić administratora wykonującego operację"
            );
        }

        User administrator = userRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() ->
                        new AdminOperationNotAllowedException(
                                "Nie znaleziono administratora wykonującego operację"
                        )
                );

        if (administrator.getRole() != Role.ADMIN) {
            throw new AdminOperationNotAllowedException(
                    "Operację może zarejestrować wyłącznie administrator"
            );
        }

        return administrator;
    }

    private AdminAuditLogResponse mapResponse(
            AdminAuditLog log
    ) {
        return new AdminAuditLogResponse(
                log.getId(),
                log.getAdminId(),
                log.getAdminUsername(),
                log.getAction(),
                log.getTargetType(),
                log.getTargetId(),
                log.getTargetLabel(),
                log.getDetails(),
                log.getCreatedAt()
        );
    }

    private Sort buildSort(String direction) {
        Sort.Direction safeDirection =
                "asc".equalsIgnoreCase(direction)
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;

        return Sort.by(
                safeDirection,
                "createdAt"
        );
    }

    private String trimToLength(
            String value,
            int maximumLength
    ) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();

        if (trimmed.length() <= maximumLength) {
            return trimmed;
        }

        return trimmed.substring(0, maximumLength);
    }
}