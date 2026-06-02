package com.example.backend.repository;

import com.example.backend.entity.Legend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface LegendRepository extends JpaRepository<Legend, Long>, JpaSpecificationExecutor<Legend> {
}