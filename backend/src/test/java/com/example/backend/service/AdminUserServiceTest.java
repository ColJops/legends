package com.example.backend.service;

import com.example.backend.dto.admin.UserContentAction;
import com.example.backend.entity.AdminAuditAction;
import com.example.backend.entity.AdminAuditTargetType;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.exception.AdminOperationNotAllowedException;
import com.example.backend.repository.LegendRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.upload.FileUploadService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private LegendRepository legendRepository;

    @Mock
    private FileUploadService fileUploadService;

    @Mock
    private AdminAuditService adminAuditService;

    @InjectMocks
    private AdminUserService adminUserService;

    @Test
    void preventsAdminFromChangingOwnRoleOrLockingSelf() {
        UUID adminId = UUID.randomUUID();
        User admin = User.builder().id(adminId).username("admin").role(Role.ADMIN).build();

        when(userRepository.findById(adminId)).thenReturn(Optional.of(admin));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(admin));

        assertThatThrownBy(() -> adminUserService.updateRole(adminId, Role.USER, "admin"))
                .isInstanceOf(AdminOperationNotAllowedException.class)
                .hasMessageContaining("własnego konta");

        assertThatThrownBy(() -> adminUserService.updateLock(adminId, true, "admin"))
                .isInstanceOf(AdminOperationNotAllowedException.class)
                .hasMessageContaining("własnego konta");
    }

    @Test
    void preventsDemotingLastAdministrator() {
        UUID targetId = UUID.randomUUID();
        User targetAdmin = User.builder().id(targetId).username("admin2").role(Role.ADMIN).build();
        User currentAdmin = User.builder().id(UUID.randomUUID()).username("admin1").role(Role.ADMIN).build();

        when(userRepository.findById(targetId)).thenReturn(Optional.of(targetAdmin));
        when(userRepository.findByUsername("admin1")).thenReturn(Optional.of(currentAdmin));
        when(userRepository.countByRole(Role.ADMIN)).thenReturn(1L);

        assertThatThrownBy(() -> adminUserService.updateRole(targetId, Role.USER, "admin1"))
                .isInstanceOf(AdminOperationNotAllowedException.class)
                .hasMessageContaining("ostatniemu administratorowi");
    }

    @Test
    void updatesUserRoleAndRecordsAudit() {
        UUID targetId = UUID.randomUUID();
        User target = User.builder().id(targetId).username("user1").role(Role.USER).build();
        User currentAdmin = User.builder().id(UUID.randomUUID()).username("admin1").role(Role.ADMIN).build();

        when(userRepository.findById(targetId)).thenReturn(Optional.of(target));
        when(userRepository.findByUsername("admin1")).thenReturn(Optional.of(currentAdmin));

        adminUserService.updateRole(targetId, Role.ADMIN, "admin1");

        assertThat(target.getRole()).isEqualTo(Role.ADMIN);
        verify(userRepository).save(target);
        verify(adminAuditService).record(
                AdminAuditAction.USER_ROLE_CHANGED,
                AdminAuditTargetType.USER,
                targetId,
                "user1",
                "Zmiana roli z USER na ADMIN"
        );
    }

    @Test
    void deletesUserAndAnonymizesLegendsByDefault() {
        UUID targetId = UUID.randomUUID();
        User target = User.builder().id(targetId).username("user1").role(Role.USER).build();
        User currentAdmin = User.builder().id(UUID.randomUUID()).username("admin1").role(Role.ADMIN).build();

        when(userRepository.findById(targetId)).thenReturn(Optional.of(target));
        when(userRepository.findByUsername("admin1")).thenReturn(Optional.of(currentAdmin));

        adminUserService.deleteUser(targetId, UserContentAction.ANONYMIZE, "admin1");

        verify(legendRepository).anonymizeByAuthorId(targetId);
        verify(userRepository).delete(target);
        verify(adminAuditService).record(
                AdminAuditAction.USER_DELETED,
                AdminAuditTargetType.USER,
                targetId,
                "user1",
                "Usunięto użytkownika. Operacja na treściach: ANONYMIZE"
        );
    }
}
