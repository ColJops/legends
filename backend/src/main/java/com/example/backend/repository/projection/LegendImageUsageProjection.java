package com.example.backend.repository.projection;

import java.util.UUID;

public interface LegendImageUsageProjection {

    UUID getId();

    String getTitle();

    String getImageUrl();
}