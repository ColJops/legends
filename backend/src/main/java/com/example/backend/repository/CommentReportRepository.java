package com.example.backend.repository;

import com.example.backend.entity.CommentReport;
import com.example.backend.entity.LegendReportStatus;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CommentReportRepository extends JpaRepository<CommentReport, UUID> {

    long countByStatus(LegendReportStatus status);

    boolean existsByComment_IdAndReporter_IdAndStatus(
            UUID commentId,
            UUID reporterId,
            LegendReportStatus status
    );

    @EntityGraph(attributePaths = {"comment", "comment.author", "comment.legend"})
    Page<CommentReport> findAllByStatus(
            LegendReportStatus status,
            @NonNull Pageable pageable
    );
}
