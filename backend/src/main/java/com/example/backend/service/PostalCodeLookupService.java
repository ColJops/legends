package com.example.backend.service;

import com.example.backend.dto.PostalCodeLocationCandidate;
import com.example.backend.dto.PostalCodeLookupResponse;
import com.example.backend.entity.Region;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.net.http.HttpClient;
import java.text.Normalizer;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Locale;
import java.util.Set;

@Service
public class PostalCodeLookupService {

    private static final Duration CACHE_TTL = Duration.ofHours(24);
    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(3);
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(5);

    private final RestClient restClient;
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    public PostalCodeLookupService(
            RestClient.Builder restClientBuilder,
            @Value("${app.postal-codes.api-base-url}") String apiBaseUrl
    ) {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(CONNECT_TIMEOUT)
                .build();
        JdkClientHttpRequestFactory requestFactory =
                new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(READ_TIMEOUT);

        this.restClient = restClientBuilder
                .baseUrl(apiBaseUrl)
                .requestFactory(requestFactory)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.USER_AGENT, "Legends/0.8 postal-code lookup")
                .build();
    }

    public PostalCodeLookupResponse lookup(String input) {
        String postalCode = normalizePostalCode(input);
        Instant now = Instant.now();
        CacheEntry entry = cache.compute(postalCode, (key, current) -> {
            if (current != null && current.expiresAt().isAfter(now)) {
                return current;
            }
            return new CacheEntry(fetch(key), now.plus(CACHE_TTL));
        });
        return entry.response();
    }

    private PostalCodeLookupResponse fetch(String postalCode) {
        try {
            Teryt24Response response = restClient.get()
                    .uri("/v1/postal-codes/{code}", postalCode)
                    .retrieve()
                    .body(Teryt24Response.class);
            return toResponse(postalCode, response);
        } catch (HttpClientErrorException.NotFound exception) {
            return new PostalCodeLookupResponse(postalCode, java.util.List.of());
        } catch (RestClientException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Postal code lookup is temporarily unavailable",
                    exception
            );
        }
    }

    private PostalCodeLookupResponse toResponse(
            String postalCode,
            Teryt24Response response
    ) {
        Set<PostalCodeLocationCandidate> candidates = new LinkedHashSet<>();
        List<Teryt24Row> rows = response == null || response.rows() == null
                ? List.of()
                : response.rows();
        for (Teryt24Row row : rows) {
            if (row == null) {
                continue;
            }
            String city = row.city() == null ? null : row.city().trim();
            Region region = toRegion(row.province());
            if (city != null && !city.isEmpty() && region != null) {
                candidates.add(new PostalCodeLocationCandidate(city, region));
            }
        }
        return new PostalCodeLookupResponse(postalCode, List.copyOf(candidates));
    }

    private Region toRegion(String province) {
        if (province == null) {
            return null;
        }
        String normalized = normalizeName(province);
        for (Region region : Region.values()) {
            if (normalizeName(region.name()).equals(normalized)) {
                return region;
            }
        }
        return null;
    }

    private String normalizeName(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replaceAll("[^\\p{Alnum}]", "")
                .toUpperCase(Locale.ROOT);
    }

    private String normalizePostalCode(String input) {
        if (input == null || !input.trim().matches("(?:\\d{2}-\\d{3}|\\d{5})")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Postal code must use the XX-XXX format"
            );
        }
        String digits = input.trim().replace("-", "");
        return digits.substring(0, 2) + "-" + digits.substring(2);
    }

    private record Teryt24Response(List<Teryt24Row> rows) {
    }

    private record Teryt24Row(String city, String province) {
    }

    private record CacheEntry(PostalCodeLookupResponse response, Instant expiresAt) {
    }
}
