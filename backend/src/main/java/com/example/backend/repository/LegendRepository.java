package com.example.backend.repository;

import com.example.backend.entity.Legend;
import org.jspecify.annotations.NonNull;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;

import com.example.backend.repository.projection.LegendImageUsageProjection;

import java.util.Collection;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface LegendRepository
        extends JpaRepository<Legend, Long>,
        JpaSpecificationExecutor<Legend> {

    @Override
    @EntityGraph(attributePaths = "author")
    Page<Legend> findAll(
            @NonNull Specification<Legend> specification,
            @NonNull Pageable pageable
    );

    @Override
    @EntityGraph(attributePaths = "author")
    @NonNull
    Optional<Legend> findById(@NonNull Long id);

    @Override
    @EntityGraph(attributePaths = "author")
    @NonNull
    List<Legend> findAll();

    long countByCreatedAtGreaterThanEqual(LocalDateTime date);

    @EntityGraph(attributePaths = "author")
    List<Legend> findTop5ByOrderByCreatedAtDesc();

    @Query("""
            SELECT l.category, COUNT(l)
            FROM Legend l
            GROUP BY l.category
            """)
    List<Object[]> countByCategory();

    @Query("""
            SELECT l.region, COUNT(l)
            FROM Legend l
            GROUP BY l.region
            """)
    List<Object[]> countByRegion();

    @Query("""
            SELECT l.imageUrl
            FROM Legend l
            WHERE l.imageUrl IS NOT NULL
            """)
    List<String> findAllImageUrls();

    @Query("""
        SELECT l.author.id, COUNT(l.id)
        FROM Legend l
        WHERE l.author.id IN :authorIds
        GROUP BY l.author.id
        """)
    List<Object[]> countByAuthorIds(
            @Param("authorIds")
            Collection<Long> authorIds
    );

    @Query("""
        SELECT l.imageUrl
        FROM Legend l
        WHERE l.author.id = :authorId
          AND l.imageUrl IS NOT NULL
        """)
    List<String> findImageUrlsByAuthorId(
            @Param("authorId") Long authorId
    );

    @Modifying(
            clearAutomatically = true,
            flushAutomatically = true
    )
    @Query("""
        UPDATE Legend l
        SET l.author = null
        WHERE l.author.id = :authorId
        """)
    int anonymizeByAuthorId(
            @Param("authorId") Long authorId
    );

    @Modifying(
            clearAutomatically = true,
            flushAutomatically = true
    )
    @Query("""
        DELETE FROM Legend l
        WHERE l.author.id = :authorId
        """)
    int deleteByAuthorId(
            @Param("authorId") Long authorId
    );

    @Query("""
        SELECT
            l.id AS id,
            l.title AS title,
            l.imageUrl AS imageUrl
        FROM Legend l
        WHERE l.imageUrl IS NOT NULL
          AND l.imageUrl <> ''
        """)
    List<LegendImageUsageProjection> findImageUsages();

}
