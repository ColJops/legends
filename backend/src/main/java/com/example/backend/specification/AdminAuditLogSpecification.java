package com.example.backend.specification;

import com.example.backend.entity.AdminAuditAction;
import com.example.backend.entity.AdminAuditLog;
import com.example.backend.entity.AdminAuditTargetType;
import org.springframework.data.jpa.domain.Specification;

public final class AdminAuditLogSpecification {

    private AdminAuditLogSpecification() {
    }

    public static Specification<AdminAuditLog> containsText(
            String search
    ) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return cb.conjunction();
            }

            String pattern =
                    "%" + search.trim().toLowerCase() + "%";

            return cb.or(
                    cb.like(
                            cb.lower(root.get("adminUsername")),
                            pattern
                    ),
                    cb.like(
                            cb.lower(root.get("targetLabel")),
                            pattern
                    ),
                    cb.like(
                            cb.lower(root.get("details")),
                            pattern
                    )
            );
        };
    }

    public static Specification<AdminAuditLog> hasAction(
            AdminAuditAction action
    ) {
        return (root, query, cb) ->
                action == null
                        ? cb.conjunction()
                        : cb.equal(root.get("action"), action);
    }

    public static Specification<AdminAuditLog> hasTargetType(
            AdminAuditTargetType targetType
    ) {
        return (root, query, cb) ->
                targetType == null
                        ? cb.conjunction()
                        : cb.equal(
                        root.get("targetType"),
                        targetType
                );
    }
}