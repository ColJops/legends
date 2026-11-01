package com.example.backend.service;

import com.example.backend.dto.LegendResponse;
import com.example.backend.dto.PagedResponse;
import com.example.backend.entity.*;
import com.example.backend.repository.FavoriteLegendRepository;
import com.example.backend.repository.LegendRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FavoriteLegendServiceTest {

    @Mock
    private FavoriteLegendRepository favoriteRepository;

    @Mock
    private LegendRepository legendRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LegendService legendService;

    @InjectMocks
    private FavoriteLegendService favoriteService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void addsPublishedLegendToFavoritesAndRemovesIt() {
        UUID legendId = UUID.randomUUID();
        User user = User.builder().id(UUID.randomUUID()).username("coljops").build();
        Legend legend = Legend.builder()
                .id(legendId)
                .status(LegendStatus.PUBLISHED)
                .build();

        authenticate(user);
        when(legendRepository.findById(legendId)).thenReturn(Optional.of(legend));
        when(favoriteRepository.existsById_UserIdAndId_LegendId(user.getId(), legendId))
                .thenReturn(false);

        favoriteService.addFavorite(legendId);
        verify(favoriteRepository).save(any(FavoriteLegend.class));

        favoriteService.removeFavorite(legendId);
        verify(favoriteRepository).deleteById_UserIdAndId_LegendId(user.getId(), legendId);
    }

    @Test
    void returnsPagedFavoritesForCurrentUser() {
        UUID legendId = UUID.randomUUID();
        User user = User.builder().id(UUID.randomUUID()).username("coljops").build();
        Legend legend = Legend.builder().id(legendId).title("Mapa").build();
        FavoriteLegend fav = FavoriteLegend.builder().user(user).legend(legend).build();
        LegendResponse mapped = new LegendResponse(
                legendId, "Mapa", "Treść", Region.DOLNOSLASKIE, "Wrocław",
                LegendCategory.LEGENDA_HISTORYCZNA, null, null, null,
                null, "testowy2", LegendStatus.PUBLISHED, null,
                4.5, 2L, 4, true
        );

        authenticate(user);
        when(favoriteRepository.findAllById_UserIdOrderByCreatedAtDesc(eq(user.getId()), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(fav)));
        when(legendService.mapToResponse(legend)).thenReturn(mapped);

        PagedResponse<LegendResponse> result = favoriteService.getMyFavorites(0, 12);

        assertThat(result.content()).hasSize(1);
        assertThat(result.content().getFirst().title()).isEqualTo("Mapa");
        assertThat(result.content().getFirst().favorite()).isTrue();
    }

    private void authenticate(User user) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user.getUsername(), null, List.of())
        );
        when(userRepository.findByUsername(user.getUsername())).thenReturn(Optional.of(user));
    }
}