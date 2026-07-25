package com.example.backend.controller;

import com.example.backend.dto.PagedResponse;
import com.example.backend.dto.admin.AdminUserListItemResponse;
import com.example.backend.dto.admin.UpdateUserLockRequest;
import com.example.backend.dto.admin.UpdateUserRoleRequest;
import com.example.backend.service.AdminUserService;
import com.example.backend.dto.admin.UserContentAction;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public PagedResponse<AdminUserListItemResponse> getUsers(
            @RequestParam(required = false)
            String search,

            @RequestParam(required = false)
            String role,

            @RequestParam(required = false)
            Boolean enabled,

            @RequestParam(required = false)
            Boolean locked,

            @RequestParam(defaultValue = "0")
            @Min(0)
            int page,

            @RequestParam(defaultValue = "10")
            @Min(1)
            @Max(50)
            int size,

            @RequestParam(defaultValue = "createdAt")
            String sortBy,

            @RequestParam(defaultValue = "desc")
            String direction
    ) {
        return adminUserService.findAll(
                search,
                role,
                enabled,
                locked,
                page,
                size,
                sortBy,
                direction
        );
    }

    @PatchMapping("/{id}/role")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateRole(
            @PathVariable Long id,
            @Valid
            @RequestBody UpdateUserRoleRequest request,
            Authentication authentication
    ) {
        adminUserService.updateRole(
                id,
                request.role(),
                authentication.getName()
        );
    }

    @PatchMapping("/{id}/lock")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateLock(
            @PathVariable Long id,
            @Valid
            @RequestBody UpdateUserLockRequest request,
            Authentication authentication
    ) {
        adminUserService.updateLock(
                id,
                request.locked(),
                authentication.getName()
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(
            @PathVariable Long id,

            @RequestParam(
                    defaultValue = "ANONYMIZE"
            )
            UserContentAction contentAction,

            Authentication authentication
    ) {
        adminUserService.deleteUser(
                id,
                contentAction,
                authentication.getName()
        );
    }
}