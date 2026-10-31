package com.example.backend.service;

import com.example.backend.dto.LegendResponse;
import com.example.backend.dto.PagedResponse;
import com.example.backend.entity.FavoriteLegend;
import com.example.backend.entity.Legend;
import com.example.backend.entity.LegendStatus;
import com.example.backend.entity.User;
import com.example.backend.exception.LegendNotFoundException;
import com.example.backend.repository.FavoriteLegendRepository;
import com.example.backend.repository.LegendRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FavoriteLegendService {

    private final FavoriteLegendRepository favoriteRepository;
    private final LegendRepository legendRepository;
    private final UserRepository userRepository;
    private final LegendService legendService;

    @Transactional
    public void addFavorite(UUID legendId) {
        Legend legend = legendRepository.findById(legendId)
                .filter(item -> item.getStatus() == LegendStatus.PUBLISHED)
                .orElseThrow(() -> new LegendNotFoundException(legendId));

        User user = getCurrentUser();

        if (favoriteRepository.existsById_UserIdAndId_LegendId(user.getId(), legendId)) {
            return;
        }

        FavoriteLegend favorite = FavoriteLegend.builder()
                .id(new FavoriteLegend.Id(user.getId(), legendId))
                .user(user)
                .legend(legend)
                .build();

        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(UUID legendId) {
        User user = getCurrentUser();
        favoriteRepository.deleteById_UserIdAndId_LegendId(user.getId(), legendId);
    }

    @Transactional(readOnly = true)
    public PagedResponse<LegendResponse> getMyFavorites(int page, int size) {
        User user = getCurrentUser();
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.clamp(size, 1, 50)
        );

        Page<LegendResponse> result = favoriteRepository
                .findAllById_UserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(FavoriteLegend::getLegend)
                .map(legendService::mapToResponse);

        return new PagedResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isFirst(),
                result.isLast()
        );
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("User is not authenticated");
        }
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }
}
