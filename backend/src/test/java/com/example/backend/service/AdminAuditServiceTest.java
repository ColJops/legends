package com.example.backend.service;

import com.example.backend.dto.PagedResponse;
import com.example.backend.dto.admin.AdminAuditLogResponse;
import com.example.backend.entity.*;
import com.example.backend.exception.AdminOperationNotAllowedException;
import com.example.backend.repository.AdminAuditLogRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

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
class AdminAuditServiceTest {

    @Mock
    private AdminAuditLogRepository auditLogRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdminAuditService adminAuditService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void recordsAuditLogForAuthenticatedAdministrator() {
        UUID adminId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();
        User admin = User.builder()
                .id(adminId)
                .username("admin")
                .role(Role.ADMIN)
                .build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin", null, List.of())
        );
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(admin));

        adminAuditService.record(
                AdminAuditAction.LEGEND_DELETED,
                AdminAuditTargetType.LEGEND,
                targetId,
                "  Smok Wawelski  ",
                "  Usunięto duplikat  "
        );

        ArgumentCaptor<AdminAuditLog> captor = ArgumentCaptor.forClass(AdminAuditLog.class);
        verify(auditLogRepository).save(captor.capture());
        AdminAuditLog saved = captor.getValue();

        assertThat(saved.getAdminId()).isEqualTo(adminId);
        assertThat(saved.getAdminUsername()).isEqualTo("admin");
        assertThat(saved.getAction()).isEqualTo(AdminAuditAction.LEGEND_DELETED);
        assertThat(saved.getTargetType()).isEqualTo(AdminAuditTargetType.LEGEND);
        assertThat(saved.getTargetId()).isEqualTo(targetId);
        assertThat(saved.getTargetLabel()).isEqualTo("Smok Wawelski");
        assertThat(saved.getDetails()).isEqualTo("Usunięto duplikat");
    }

    @Test
    void rejectsRecordingWhenUserIsNotAdmin() {
        User normalUser = User.builder()
                .id(UUID.randomUUID())
                .username("user")
                .role(Role.USER)
                .build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("user", null, List.of())
        );
        when(userRepository.findByUsername("user")).thenReturn(Optional.of(normalUser));

        assertThatThrownBy(() -> adminAuditService.record(
                AdminAuditAction.USER_LOCKED,
                AdminAuditTargetType.USER,
                UUID.randomUUID(),
                "target",
                "details"
        )).isInstanceOf(AdminOperationNotAllowedException.class);
    }

    @Test
    @SuppressWarnings("unchecked")
    void findAllReturnsPagedAuditLogs() {
        AdminAuditLog log = AdminAuditLog.builder()
                .id(UUID.randomUUID())
                .adminId(UUID.randomUUID())
                .adminUsername("admin")
                .action(AdminAuditAction.MEDIA_ORPHANS_CLEANED)
                .targetType(AdminAuditTargetType.SYSTEM)
                .createdAt(LocalDateTime.now())
                .build();

        when(auditLogRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(log)));

        PagedResponse<AdminAuditLogResponse> result = adminAuditService.findAll(
                "admin",
                AdminAuditAction.MEDIA_ORPHANS_CLEANED,
                AdminAuditTargetType.SYSTEM,
                0,
                20,
                "desc"
        );

        assertThat(result.content()).hasSize(1);
        assertThat(result.content().getFirst().adminUsername()).isEqualTo("admin");
    }
}
