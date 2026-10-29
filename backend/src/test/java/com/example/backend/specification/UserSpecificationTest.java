package com.example.backend.specification;

import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import jakarta.persistence.criteria.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserSpecificationTest {

    @Mock
    private Root<User> root;

    @Mock
    private CriteriaQuery<?> query;

    @Mock
    private CriteriaBuilder cb;

    @Mock
    private Path<Object> path;

    @Mock
    private Expression<String> lowerExpression;

    @Mock
    private Predicate conjunctionPredicate;

    @Mock
    private Predicate disjunctionPredicate;

    @Mock
    private Predicate equalPredicate;

    @Mock
    private Predicate likePredicate;

    @Mock
    private Predicate orPredicate;

    @BeforeEach
    void setUp() {
        lenient().when(cb.conjunction()).thenReturn(conjunctionPredicate);
        lenient().when(cb.disjunction()).thenReturn(disjunctionPredicate);
    }

    @Test
    @SuppressWarnings({"unchecked", "rawtypes"})
    void containsTextSearchesUsernameAndEmailCaseInsensitively() {
        assertThat(UserSpecification.containsText(null).toPredicate(root, query, cb))
                .isSameAs(conjunctionPredicate);
        assertThat(UserSpecification.containsText("   ").toPredicate(root, query, cb))
                .isSameAs(conjunctionPredicate);

        when(root.get(anyString())).thenReturn((Path) path);
        when(cb.lower(any())).thenReturn(lowerExpression);
        when(cb.like(eq(lowerExpression), eq("%mara%"))).thenReturn(likePredicate);
        when(cb.or(likePredicate, likePredicate)).thenReturn(orPredicate);

        Predicate result = UserSpecification.containsText("  Mara  ")
                .toPredicate(root, query, cb);

        assertThat(result).isSameAs(orPredicate);
        verify(root).get("username");
        verify(root).get("email");
    }

    @Test
    void hasRoleHandlesBlankValidAndInvalidRoles() {
        assertThat(UserSpecification.hasRole("").toPredicate(root, query, cb))
                .isSameAs(conjunctionPredicate);

        when(root.get("role")).thenReturn(path);
        when(cb.equal(path, Role.ADMIN)).thenReturn(equalPredicate);

        Predicate validResult = UserSpecification.hasRole("admin")
                .toPredicate(root, query, cb);
        assertThat(validResult).isSameAs(equalPredicate);

        Predicate invalidResult = UserSpecification.hasRole("SUPERUSER")
                .toPredicate(root, query, cb);
        assertThat(invalidResult).isSameAs(disjunctionPredicate);
    }

    @Test
    void hasEnabledStatusAndLockedStatusHandleNullAndBooleanValues() {
        assertThat(UserSpecification.hasEnabledStatus(null).toPredicate(root, query, cb))
                .isSameAs(conjunctionPredicate);
        assertThat(UserSpecification.hasLockedStatus(null).toPredicate(root, query, cb))
                .isSameAs(conjunctionPredicate);

        when(root.get("enabled")).thenReturn(path);
        when(root.get("locked")).thenReturn(path);
        when(cb.equal(path, true)).thenReturn(equalPredicate);

        assertThat(UserSpecification.hasEnabledStatus(true).toPredicate(root, query, cb))
                .isSameAs(equalPredicate);
        assertThat(UserSpecification.hasLockedStatus(true).toPredicate(root, query, cb))
                .isSameAs(equalPredicate);
    }
}