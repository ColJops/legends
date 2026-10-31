package com.example.backend.repository;

import com.example.backend.entity.FavoriteLegend;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FavoriteLegendRepository extends JpaRepository<FavoriteLegend, FavoriteLegend.Id> {

    boolean existsById_UserIdAndId_LegendId(UUID userId, UUID legendId);

    void deleteById_UserIdAndId_LegendId(UUID userId, UUID legendId);

    @EntityGraph(attributePaths = {"legend", "legend.author"})
    Page<FavoriteLegend> findAllById_UserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}
