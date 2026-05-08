package com.example.backend.repository;

import com.example.backend.entity.Legend;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LegendRepository extends JpaRepository<Legend, Long> {

    List<Legend> findByRegionIgnoreCase(String region);

    List<Legend> findByCityIgnoreCase(String city);

    List<Legend> findByCategoryIgnoreCase(String category);

    List<Legend> findByTitleContainingIgnoreCase(String title);
}