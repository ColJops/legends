package com.example.backend.repository;

import com.example.backend.entity.LegendRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface LegendRatingRepository extends JpaRepository<LegendRating, UUID> {

    boolean existsByLegend_IdAndUser_Id(UUID legendId, UUID userId);

    Optional<LegendRating> findByLegend_IdAndUser_Id(UUID legendId, UUID userId);

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM LegendRating r WHERE r.legend.id = :legendId")
    double getAverageRating(@Param("legendId") UUID legendId);

    long countByLegend_Id(UUID legendId);

    long countByUser_Id(UUID userId);
}
