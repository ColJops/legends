package com.example.backend.specification;

import com.example.backend.entity.Legend;
import com.example.backend.entity.LegendCategory;
import com.example.backend.entity.LegendStatus;
import com.example.backend.entity.Region;
import jakarta.persistence.criteria.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LegendSpecificationTest {

    @Mock
    private Root<Legend> root;

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
    void hasStatusBuildsEqualPredicate() {
        when(root.get("status")).thenReturn(path);
        when(cb.equal(path, LegendStatus.PUBLISHED)).thenReturn(equalPredicate);

        Predicate result = LegendSpecification.hasStatus(LegendStatus.PUBLISHED)
                .toPredicate(root, query, cb);

        assertThat(result).isSameAs(equalPredicate);
        verify(cb).equal(path, LegendStatus.PUBLISHED);
    }

    @Test
    void hasAuthorIdReturnsDisjunctionWhenNullAndEqualWhenPresent() {
        Predicate nullResult = LegendSpecification.hasAuthorId(null)
                .toPredicate(root, query, cb);
        assertThat(nullResult).isSameAs(disjunctionPredicate);

        UUID authorId = UUID.randomUUID();
        @SuppressWarnings("unchecked")
        Path<Object> authorPath = mock(Path.class);
        when(root.get("author")).thenReturn(authorPath);
        when(authorPath.get("id")).thenReturn(path);
        when(cb.equal(path, authorId)).thenReturn(equalPredicate);

        Predicate validResult = LegendSpecification.hasAuthorId(authorId)
                .toPredicate(root, query, cb);

        assertThat(validResult).isSameAs(equalPredicate);
    }

    @Test
    @SuppressWarnings({"unchecked", "rawtypes"})
    void containsTextReturnsConjunctionWhenBlankAndOrLikeWhenProvided() {
        assertThat(LegendSpecification.containsText(null).toPredicate(root, query, cb))
                .isSameAs(conjunctionPredicate);
        assertThat(LegendSpecification.containsText("   ").toPredicate(root, query, cb))
                .isSameAs(conjunctionPredicate);

        when(root.get(anyString())).thenReturn((Path) path);
        when(cb.lower(any())).thenReturn(lowerExpression);
        when(cb.like(eq(lowerExpression), eq("%wawel%"))).thenReturn(likePredicate);
        when(cb.or(any(Predicate.class), any(Predicate.class), any(Predicate.class)))
                .thenReturn(orPredicate);

        Predicate result = LegendSpecification.containsText("WaWeL")
                .toPredicate(root, query, cb);

        assertThat(result).isSameAs(orPredicate);
        verify(root).get("title");
        verify(root).get("content");
        verify(root).get("city");
    }

    @Test
    @SuppressWarnings({"unchecked", "rawtypes"})
    void containsAdminTextJoinsAuthorLeftAndBuildsOrLikePredicate() {
        assertThat(LegendSpecification.containsAdminText("").toPredicate(root, query, cb))
                .isSameAs(conjunctionPredicate);

        Join<Object, Object> authorJoin = mock(Join.class);
        when(root.join("author", JoinType.LEFT)).thenReturn(authorJoin);
        when(root.get(anyString())).thenReturn((Path) path);
        when(authorJoin.get(anyString())).thenReturn(path);
        when(cb.lower(any())).thenReturn(lowerExpression);
        when(cb.like(eq(lowerExpression), eq("%admin%"))).thenReturn(likePredicate);
        when(cb.or(any(Predicate.class), any(Predicate.class), any(Predicate.class), any(Predicate.class)))
                .thenReturn(orPredicate);

        Predicate result = LegendSpecification.containsAdminText("  ADMIN  ")
                .toPredicate(root, query, cb);

        assertThat(result).isSameAs(orPredicate);
        verify(root).join("author", JoinType.LEFT);
        verify(authorJoin).get("username");
        verify(authorJoin).get("email");
    }

    @Test
    @SuppressWarnings({"unchecked", "rawtypes"})
    void hasCityHandlesBlankAndCaseInsensitiveMatch() {
        assertThat(LegendSpecification.hasCity(" ").toPredicate(root, query, cb))
                .isSameAs(conjunctionPredicate);

        when(root.get("city")).thenReturn((Path) path);
        when(cb.lower(any())).thenReturn(lowerExpression);
        when(cb.equal(lowerExpression, "kraków")).thenReturn(equalPredicate);

        Predicate result = LegendSpecification.hasCity("Kraków")
                .toPredicate(root, query, cb);

        assertThat(result).isSameAs(equalPredicate);
    }

    @Test
    void hasRegionHandlesBlankValidAndInvalidEnumNames() {
        assertThat(LegendSpecification.hasRegion(null).toPredicate(root, query, cb))
                .isSameAs(conjunctionPredicate);

        when(root.get("region")).thenReturn(path);
        when(cb.equal(path, Region.MALOPOLSKIE)).thenReturn(equalPredicate);

        Predicate validResult = LegendSpecification.hasRegion("malopolskie")
                .toPredicate(root, query, cb);
        assertThat(validResult).isSameAs(equalPredicate);

        Predicate invalidResult = LegendSpecification.hasRegion("ATLANTYDA")
                .toPredicate(root, query, cb);
        assertThat(invalidResult).isSameAs(disjunctionPredicate);
    }

    @Test
    void hasCategoryHandlesBlankValidAndInvalidEnumNames() {
        assertThat(LegendSpecification.hasCategory("").toPredicate(root, query, cb))
                .isSameAs(conjunctionPredicate);

        when(root.get("category")).thenReturn(path);
        when(cb.equal(path, LegendCategory.DUCHY)).thenReturn(equalPredicate);

        Predicate validResult = LegendSpecification.hasCategory("duchy")
                .toPredicate(root, query, cb);
        assertThat(validResult).isSameAs(equalPredicate);

        Predicate invalidResult = LegendSpecification.hasCategory("SCI_FI")
                .toPredicate(root, query, cb);
        assertThat(invalidResult).isSameAs(disjunctionPredicate);
    }
}