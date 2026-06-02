package com.example.backend.specification;

import com.example.backend.entity.Legend;
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
                    cb.like(cb.lower(root.get("city")), pattern),
                    cb.like(cb.lower(root.get("region")), pattern),
                    cb.like(cb.lower(root.get("category")), pattern)
            );
        };
    }

    public static Specification<Legend> hasCity(String city) {
        return (root, query, cb) ->
                city == null || city.isBlank()
                        ? cb.conjunction()
                        : cb.equal(cb.lower(root.get("city")), city.toLowerCase());
    }

    public static Specification<Legend> hasRegion(String region) {
        return (root, query, cb) ->
                region == null || region.isBlank()
                        ? cb.conjunction()
                        : cb.equal(cb.lower(root.get("region")), region.toLowerCase());
    }

    public static Specification<Legend> hasCategory(String category) {
        return (root, query, cb) ->
                category == null || category.isBlank()
                        ? cb.conjunction()
                        : cb.equal(cb.lower(root.get("category")), category.toLowerCase());
    }
}