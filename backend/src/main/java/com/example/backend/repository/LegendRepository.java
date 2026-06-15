package com.example.backend.repository;

import com.example.backend.entity.Legend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LegendRepository extends JpaRepository<Legend, Long>, JpaSpecificationExecutor<Legend> {

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
}