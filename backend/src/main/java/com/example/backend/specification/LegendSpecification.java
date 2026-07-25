package com.example.backend.specification;

import com.example.backend.entity.Legend;
import com.example.backend.entity.LegendCategory;
import com.example.backend.entity.Region;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

public class LegendSpecification {

    public static Specification<Legend> containsText(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return cb.conjunction();
            }

            String pattern = "%" + search.toLowerCase() + "%";

            return cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("content")), pattern),
                    cb.like(cb.lower(root.get("city")), pattern)
            );
        };
    }

    public static Specification<Legend> containsAdminText(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return cb.conjunction();
            }

            String pattern = "%" + search.trim().toLowerCase() + "%";

            var authorJoin = root.join("author", JoinType.LEFT);

            return cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("city")), pattern),
                    cb.like(cb.lower(authorJoin.get("username")), pattern),
                    cb.like(cb.lower(authorJoin.get("email")), pattern)
            );
        };
    }

    public static Specification<Legend> hasCity(String city) {
        return (root, query, cb) ->
                city == null || city.isBlank()
                        ? cb.conjunction()
                        : cb.equal(
                        cb.lower(root.get("city")),
                        city.toLowerCase()
                );
    }

    public static Specification<Legend> hasRegion(String region) {
        return (root, query, cb) -> {
            if (region == null || region.isBlank()) {
                return cb.conjunction();
            }

            try {
                Region parsedRegion =
                        Region.valueOf(region.toUpperCase());

                return cb.equal(root.get("region"), parsedRegion);
            } catch (IllegalArgumentException exception) {
                return cb.disjunction();
            }
        };
    }

    public static Specification<Legend> hasCategory(String category) {
        return (root, query, cb) -> {
            if (category == null || category.isBlank()) {
                return cb.conjunction();
            }

            try {
                LegendCategory parsedCategory =
                        LegendCategory.valueOf(category.toUpperCase());

                return cb.equal(root.get("category"), parsedCategory);
            } catch (IllegalArgumentException exception) {
                return cb.disjunction();
            }
        };
    }
}