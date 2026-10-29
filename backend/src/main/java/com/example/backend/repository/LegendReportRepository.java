package com.example.backend.repository;

import com.example.backend.entity.LegendReport;
import com.example.backend.entity.LegendReportStatus;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LegendReportRepository extends JpaRepository<LegendReport, UUID> {

    long countByStatus(LegendReportStatus status);

    boolean existsByLegend_IdAndReporter_IdAndStatus(
            UUID legendId,
            UUID reporterId,
            LegendReportStatus status
    );

    @EntityGraph(attributePaths = {"legend", "legend.author"})
    Page<LegendReport> findAllByStatus(
            LegendReportStatus status,
            @NonNull Pageable pageable
    );
}
