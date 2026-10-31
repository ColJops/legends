package com.example.backend.repository;

import com.example.backend.entity.LegendComment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LegendCommentRepository extends JpaRepository<LegendComment, UUID> {

    @EntityGraph(attributePaths = "author")
    List<LegendComment> findByLegend_IdAndParentIsNullOrderByCreatedAtDesc(UUID legendId);

    boolean existsByLegend_IdAndAuthor_Id(UUID legendId, UUID authorId);

    long countByAuthor_Id(UUID authorId);
}
