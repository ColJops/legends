package com.example.backend.service;

import com.example.backend.dto.LegendRequest;
import com.example.backend.dto.LegendResponse;
import com.example.backend.dto.PagedResponse;
import com.example.backend.entity.Legend;
import com.example.backend.entity.LegendCategory;
import com.example.backend.entity.Region;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.exception.InvalidCityForRegionException;
import com.example.backend.exception.LegendNotFoundException;
import com.example.backend.repository.LegendRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.upload.FileUploadService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LegendServiceTest {

    @Mock
    private LegendRepository legendRepository;

    @Mock
    private FileUploadService fileUploadService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private LegendService legendService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createSavesLegendAndMapsResponse() {
        User author = user(11L, "author", Role.USER);
        authenticateAs(author);
        LegendRequest request = request("Smok wawelski", "Kraków", null);

        when(legendRepository.save(any(Legend.class))).thenAnswer(invocation -> {
            Legend saved = invocation.getArgument(0);
            saved.setId(7L);
            saved.setCreatedAt(LocalDateTime.of(2026, 1, 2, 12, 0));
            return saved;
        });

        LegendResponse response = legendService.create(request);

        ArgumentCaptor<Legend> captor = ArgumentCaptor.forClass(Legend.class);
        verify(legendRepository).save(captor.capture());
        assertThat(captor.getValue())
                .extracting(
                        Legend::getTitle,
                        Legend::getContent,
                        Legend::getRegion,
                        Legend::getCity,
                        Legend::getCategory,
                        Legend::getImageUrl,
                        Legend::getAuthor
                )
                .containsExactly(
                        "Smok wawelski",
                        "Tresc legendy",
                        Region.MALOPOLSKIE,
                        "Kraków",
                        LegendCategory.LEGENDA,
                        null,
                        author
                );
        assertThat(response.id()).isEqualTo(7L);
        assertThat(response.title()).isEqualTo("Smok wawelski");
        assertThat(response.authorUsername()).isEqualTo("author");
    }

    @Test
    void createRejectsCityFromDifferentRegion() {
        LegendRequest request = new LegendRequest(
                "Legenda",
                "Tresc",
                Region.MAZOWIECKIE,
                "Krakow",
                LegendCategory.MIT,
                null
        );

        assertThatThrownBy(() -> legendService.create(request))
                .isInstanceOf(InvalidCityForRegionException.class)
                .hasMessageContaining("Krakow")
                .hasMessageContaining("MAZOWIECKIE");

        verify(legendRepository, never()).save(any());
    }

    @Test
    void findByIdThrowsWhenLegendDoesNotExist() {
        when(legendRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> legendService.findById(99L))
                .isInstanceOf(LegendNotFoundException.class)
                .hasMessage("Legend not found with id: 99");
    }

    @Test
    void updateChangesExistingLegendOwnedByCurrentUser() {
        User author = user(11L, "author", Role.USER);
        authenticateAs(author);
        Legend existing = legend(3L, "Stary tytul", "Warszawa");
        existing.setAuthor(author);

        LegendRequest request = new LegendRequest(
                "Nowy tytul",
                "Nowa tresc",
                Region.MAZOWIECKIE,
                "Radom",
                LegendCategory.PODANIE,
                "/image.png"
        );
        when(legendRepository.findById(3L)).thenReturn(Optional.of(existing));
        when(legendRepository.save(existing)).thenReturn(existing);

        LegendResponse response = legendService.update(3L, request);

        assertThat(response)
                .extracting(
                        LegendResponse::title,
                        LegendResponse::content,
                        LegendResponse::city,
                        LegendResponse::category,
                        LegendResponse::imageUrl
                )
                .containsExactly(
                        "Nowy tytul",
                        "Nowa tresc",
                        "Radom",
                        LegendCategory.PODANIE,
                        "/image.png"
                );
        verify(legendRepository).save(existing);
    }

    @Test
    void deleteRemovesOwnedLegendAndItsImage() {
        User author = user(11L, "author", Role.USER);
        authenticateAs(author);
        Legend existing = legend(5L, "Legenda", "Warszawa");
        existing.setAuthor(author);
        existing.setImageUrl("/uploads/legends/example.png");
        when(legendRepository.findById(5L)).thenReturn(Optional.of(existing));

        legendService.delete(5L);

        verify(legendRepository).delete(existing);
        verify(fileUploadService).deleteLegendImage(existing.getImageUrl());
    }

    @Test
    void deleteThrowsAndDoesNotDeleteMissingLegend() {
        when(legendRepository.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> legendService.delete(5L))
                .isInstanceOf(LegendNotFoundException.class);

        verify(legendRepository, never()).delete(any());
    }

    @Test
    @SuppressWarnings("unchecked")
    void findAllPagedUsesSafePagingAndSorting() {
        Legend legend = legend(1L, "Syrenka", "Warszawa");
        when(legendRepository.findAll(
                any(Specification.class),
                any(Pageable.class)
        )).thenReturn(new PageImpl<>(List.of(legend)));

        PagedResponse<LegendResponse> response = legendService.findAllPaged(
                "syrenka",
                null,
                "MAZOWIECKIE",
                "LEGENDA",
                -3,
                100,
                "unsupported",
                "asc"
        );

        ArgumentCaptor<Pageable> pageableCaptor =
                ArgumentCaptor.forClass(Pageable.class);
        verify(legendRepository).findAll(
                any(Specification.class),
                pageableCaptor.capture()
        );
        Pageable pageable = pageableCaptor.getValue();

        assertThat(pageable.getPageNumber()).isZero();
        assertThat(pageable.getPageSize()).isEqualTo(50);
        assertThat(pageable.getSort().getOrderFor("createdAt"))
                .isNotNull()
                .satisfies(order -> assertThat(order.isAscending()).isTrue());
        assertThat(response.content()).extracting(LegendResponse::title)
                .containsExactly("Syrenka");
        assertThat(response.totalElements()).isEqualTo(1);
    }

    private void authenticateAs(User user) {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        user.getUsername(),
                        null,
                        List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_" + user.getRole().name()
                                )
                        )
                );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        when(userRepository.findByUsername(user.getUsername()))
                .thenReturn(Optional.of(user));
    }

    private LegendRequest request(String title, String city, String imageUrl) {
        return new LegendRequest(
                title,
                "Tresc legendy",
                Region.MALOPOLSKIE,
                city,
                LegendCategory.LEGENDA,
                imageUrl
        );
    }

    private Legend legend(Long id, String title, String city) {
        return Legend.builder()
                .id(id)
                .title(title)
                .content("Tresc")
                .region(Region.MAZOWIECKIE)
                .city(city)
                .category(LegendCategory.LEGENDA)
                .createdAt(LocalDateTime.of(2026, 1, 1, 10, 0))
                .build();
    }

    private User user(Long id, String username, Role role) {
        return User.builder()
                .id(id)
                .username(username)
                .email(username + "@example.com")
                .password("encoded")
                .role(role)
                .enabled(true)
                .locked(false)
                .createdAt(LocalDateTime.of(2026, 1, 1, 9, 0))
                .build();
    }
}
