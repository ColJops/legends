package com.example.backend.validation;

import com.example.backend.entity.Region;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CityValidatorTest {

    @Test
    void acceptsCityAssignedToRegionAndTrimsWhitespace() {
        assertThat(CityValidator.isValid(Region.MAZOWIECKIE, "  Warszawa  ")).isTrue();
    }

    @Test
    void rejectsCityAssignedToDifferentRegion() {
        assertThat(CityValidator.isValid(Region.MAZOWIECKIE, "Krakow")).isFalse();
    }

    @Test
    void rejectsMissingRegionOrCity() {
        assertThat(CityValidator.isValid(null, "Warszawa")).isFalse();
        assertThat(CityValidator.isValid(Region.MAZOWIECKIE, null)).isFalse();
        assertThat(CityValidator.isValid(Region.MAZOWIECKIE, "   ")).isFalse();
    }
}
