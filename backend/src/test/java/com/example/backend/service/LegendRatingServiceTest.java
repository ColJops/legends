package com.example.backend.service;

import com.example.backend.dto.community.RatingRequest;
import com.example.backend.dto.community.RatingSummaryResponse;
import com.example.backend.entity.*;
import com.example.backend.exception.AdminOperationNotAllowedException;
import com.example.backend.exception.LegendAccessDeniedException;
import com.example.backend.repository.LegendRatingRepository;
import com.example.backend.repository.LegendRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LegendRatingServiceTest {

    @Mock
    private LegendRepository legendRepository;

    @Mock
    private LegendRatingRepository ratingRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private LegendRatingService ratingService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void savesRatingAndReturnsUpdatedSummary() {
        UUID legendId = UUID.randomUUID();
        User author = User.builder().id(UUID.randomUUID()).username("testowy2").build();
        User voter = User.builder().id(UUID.randomUUID()).username("coljops").build();
        Legend legend = Legend.builder()
                .id(legendId)
                .status(LegendStatus.PUBLISHED)
                .author(author)
                .build();

        authenticate(voter);
        when(legendRepository.findById(legendId)).thenReturn(Optional.of(legend));
        when(ratingRepository.existsByLegend_IdAndUser_Id(legendId, voter.getId()))
                .thenReturn(false);
        when(ratingRepository.getAverageRating(legendId)).thenReturn(4.5);
        when(ratingRepository.countByLegend_Id(legendId)).thenReturn(2L);
        when(ratingRepository.findByLegend_IdAndUser_Id(legendId, voter.getId()))
                .thenReturn(Optional.of(LegendRating.builder().rating(4).build()));

        RatingSummaryResponse summary = ratingService.rateLegend(legendId, new RatingRequest(4));

        verify(ratingRepository).saveAndFlush(any(LegendRating.class));
        assertThat(summary.averageRating()).isEqualTo(4.5);
        assertThat(summary.ratingsCount()).isEqualTo(2L);
        assertThat(summary.userRating()).isEqualTo(4);
    }

    @Test
    void forbidsAuthorFromRatingOwnLegend() {
        UUID legendId = UUID.randomUUID();
        User author = User.builder().id(UUID.randomUUID()).username("testowy2").build();
        Legend legend = Legend.builder()
                .id(legendId)
                .status(LegendStatus.PUBLISHED)
                .author(author)
                .build();

        authenticate(author);
        when(legendRepository.findById(legendId)).thenReturn(Optional.of(legend));

        assertThatThrownBy(() -> ratingService.rateLegend(legendId, new RatingRequest(5)))
                .isInstanceOf(LegendAccessDeniedException.class);

        verify(ratingRepository, never()).saveAndFlush(any());
    }

    @Test
    void forbidsVotingMoreThanOnceOnSameLegend() {
        UUID legendId = UUID.randomUUID();
        User voter = User.builder().id(UUID.randomUUID()).username("coljops").build();
        Legend legend = Legend.builder()
                .id(legendId)
                .status(LegendStatus.PUBLISHED)
                .build();

        authenticate(voter);
        when(legendRepository.findById(legendId)).thenReturn(Optional.of(legend));
        when(ratingRepository.existsByLegend_IdAndUser_Id(legendId, voter.getId()))
                .thenReturn(true);

        assertThatThrownBy(() -> ratingService.rateLegend(legendId, new RatingRequest(5)))
                .isInstanceOf(AdminOperationNotAllowedException.class)
                .hasMessageContaining("tylko raz");
    }

    private void authenticate(User user) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user.getUsername(), null, List.of())
        );
        when(userRepository.findByUsername(user.getUsername())).thenReturn(Optional.of(user));
    }
}
