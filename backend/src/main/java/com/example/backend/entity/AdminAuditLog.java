package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "admin_audit_logs",
        indexes = {
                @Index(
                        name = "idx_audit_created_at",
                        columnList = "created_at"
                ),
                @Index(
                        name = "idx_audit_admin_username",
                        columnList = "admin_username"
                ),
                @Index(
                        name = "idx_audit_action",
                        columnList = "action"
                ),
                @Index(
                        name = "idx_audit_target_type",
                        columnList = "target_type"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_id", nullable = false)
    private Long adminId;

    @Column(
            name = "admin_username",
            nullable = false,
            length = 100
    )
    private String adminUsername;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 60)
    private AdminAuditAction action;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "target_type",
            nullable = false,
            length = 30
    )
    private AdminAuditTargetType targetType;

    @Column(name = "target_id")
    private Long targetId;

    @Column(name = "target_label", length = 255)
    private String targetLabel;

    @Column(length = 2000)
    private String details;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}