package com.example.backend.specification;

import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import org.springframework.data.jpa.domain.Specification;

public final class UserSpecification {

    private UserSpecification() {
    }

    public static Specification<User> containsText(
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
                            cb.lower(root.get("username")),
                            pattern
                    ),
                    cb.like(
                            cb.lower(root.get("email")),
                            pattern
                    )
            );
        };
    }

    public static Specification<User> hasRole(
            String role
    ) {
        return (root, query, cb) -> {
            if (role == null || role.isBlank()) {
                return cb.conjunction();
            }

            try {
                Role parsedRole =
                        Role.valueOf(role.toUpperCase());

                return cb.equal(
                        root.get("role"),
                        parsedRole
                );
            } catch (IllegalArgumentException exception) {
                return cb.disjunction();
            }
        };
    }

    public static Specification<User> hasEnabledStatus(
            Boolean enabled
    ) {
        return (root, query, cb) ->
                enabled == null
                        ? cb.conjunction()
                        : cb.equal(
                        root.get("enabled"),
                        enabled
                );
    }

    public static Specification<User> hasLockedStatus(
            Boolean locked
    ) {
        return (root, query, cb) ->
                locked == null
                        ? cb.conjunction()
                        : cb.equal(
                        root.get("locked"),
                        locked
                );
    }
}