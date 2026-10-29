package com.example.backend.specification;

import com.example.backend.entity.AdminAuditAction;
import com.example.backend.entity.AdminAuditLog;
import com.example.backend.entity.AdminAuditTargetType;
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
class AdminAuditLogSpecificationTest {

    @Mock
    private Root<AdminAuditLog> root;

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
    private Predicate equalPredicate;

    @Mock
    private Predicate likePredicate;

    @Mock
    private Predicate orPredicate;

    @BeforeEach
    void setUp() {
        lenient().when(cb.conjunction()).thenReturn(conjunctionPredicate);
    }

    @Test
    @SuppressWarnings({"unchecked", "rawtypes"})
    void containsTextSearchesAdminUsernameTargetLabelAndDetails() {
        assertThat(AdminAuditLogSpecification.containsText(null).toPredicate(root, query, cb))
                .isSameAs(conjunctionPredicate);
        assertThat(AdminAuditLogSpecification.containsText("  ").toPredicate(root, query, cb))
                .isSameAs(conjunctionPredicate);

        when(root.get(anyString())).thenReturn((Path) path);
        when(cb.lower(any())).thenReturn(lowerExpression);
        when(cb.like(eq(lowerExpression), eq("%usunięto%"))).thenReturn(likePredicate);
        when(cb.or(likePredicate, likePredicate, likePredicate)).thenReturn(orPredicate);

        Predicate result = AdminAuditLogSpecification.containsText(" Usunięto ")
                .toPredicate(root, query, cb);

        assertThat(result).isSameAs(orPredicate);
        verify(root).get("adminUsername");
        verify(root).get("targetLabel");
        verify(root).get("details");
    }

    @Test
    void hasActionAndHasTargetTypeHandleNullAndEnumValues() {
        assertThat(AdminAuditLogSpecification.hasAction(null).toPredicate(root, query, cb))
                .isSameAs(conjunctionPredicate);
        assertThat(AdminAuditLogSpecification.hasTargetType(null).toPredicate(root, query, cb))
                .isSameAs(conjunctionPredicate);

        when(root.get("action")).thenReturn(path);
        when(root.get("targetType")).thenReturn(path);
        when(cb.equal(path, AdminAuditAction.LEGEND_APPROVED)).thenReturn(equalPredicate);
        when(cb.equal(path, AdminAuditTargetType.LEGEND)).thenReturn(equalPredicate);

        assertThat(AdminAuditLogSpecification.hasAction(AdminAuditAction.LEGEND_APPROVED)
                .toPredicate(root, query, cb)).isSameAs(equalPredicate);

        assertThat(AdminAuditLogSpecification.hasTargetType(AdminAuditTargetType.LEGEND)
                .toPredicate(root, query, cb)).isSameAs(equalPredicate);
    }
}