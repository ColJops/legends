package com.example.backend.service;

import com.example.backend.dto.community.RatingRequest;
import com.example.backend.dto.community.RatingSummaryResponse;
import com.example.backend.entity.*;
import com.example.backend.exception.AdminOperationNotAllowedException;
import com.example.backend.exception.LegendAccessDeniedException;
import com.example.backend.exception.LegendNotFoundException;
import com.example.backend.repository.LegendRatingRepository;
import com.example.backend.repository.LegendRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LegendRatingService {

    private final LegendRepository legendRepository;
    private final LegendRatingRepository ratingRepository;
    private final UserRepository userRepository;

    @Transactional
    public RatingSummaryResponse rateLegend(UUID legendId, RatingRequest request) {
        Legend legend = legendRepository.findById(legendId)
                .filter(l -> l.getStatus() == LegendStatus.PUBLISHED)
                .orElseThrow(() -> new LegendNotFoundException(legendId));

        User user = getCurrentUser();

        // Nie można oceniać własnej legendy
        if (legend.getAuthor() != null && legend.getAuthor().getId().equals(user.getId())) {
            throw new LegendAccessDeniedException();
        }

        // Można ocenić tylko raz
        if (ratingRepository.existsByLegend_IdAndUser_Id(legendId, user.getId())) {
            throw new AdminOperationNotAllowedException("Możesz ocenić daną legendę tylko raz.");
        }

        LegendRating rating = LegendRating.builder()
                .legend(legend)
                .user(user)
                .rating(request.rating())
                .build();

        ratingRepository.saveAndFlush(rating);

        return getRatingSummary(legendId, user.getId());
    }

    @Transactional(readOnly = true)
    public RatingSummaryResponse getRatingSummary(UUID legendId, UUID currentUserId) {
        double avg = Math.round(ratingRepository.getAverageRating(legendId) * 10.0) / 10.0;
        long count = ratingRepository.countByLegend_Id(legendId);
        Integer userRating = currentUserId == null
                ? null
                : ratingRepository.findByLegend_IdAndUser_Id(legendId, currentUserId)
                .map(LegendRating::getRating)
                .orElse(null);

        return new RatingSummaryResponse(avg, count, userRating);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }
}
