package com.example.backend.controller;

import com.example.backend.dto.LegendResponse;
import com.example.backend.dto.PagedResponse;
import com.example.backend.dto.community.*;
import com.example.backend.service.FavoriteLegendService;
import com.example.backend.service.LegendCommentService;
import com.example.backend.service.LegendRatingService;
import com.example.backend.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Validated
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommunityController {

    private final LegendCommentService commentService;
    private final LegendRatingService ratingService;
    private final FavoriteLegendService favoriteService;
    private final UserService userService;

    // 1. KOMENTARZE
    @GetMapping("/legends/{id}/comments")
    public List<CommentResponse> getComments(@PathVariable UUID id) {
        return commentService.getComments(id);
    }

    @PostMapping("/legends/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CommentRequest request
    ) {
        return commentService.addComment(id, request);
    }

    @DeleteMapping("/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable UUID commentId) {
        commentService.deleteComment(commentId);
    }

    // 2. OCENY (1-5 GWIAZDEK)
    @PostMapping("/legends/{id}/rating")
    public RatingSummaryResponse rateLegend(
            @PathVariable UUID id,
            @Valid @RequestBody RatingRequest request
    ) {
        return ratingService.rateLegend(id, request);
    }

    // 3. ULUBIONE LEGENDY
    @GetMapping("/legends/favorites")
    public PagedResponse<LegendResponse> getMyFavorites(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "12") @Min(1) @Max(50) int size
    ) {
        return favoriteService.getMyFavorites(page, size);
    }

    @PostMapping("/legends/{id}/favorite")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addFavorite(@PathVariable UUID id) {
        favoriteService.addFavorite(id);
    }

    @DeleteMapping("/legends/{id}/favorite")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFavorite(@PathVariable UUID id) {
        favoriteService.removeFavorite(id);
    }

    // 4. PUBLICZNY / PRYWATNY PROFIL AUTORA
    @GetMapping("/users/{username}/profile")
    public PublicUserProfileResponse getPublicProfile(@PathVariable String username) {
        return userService.getPublicProfile(username);
    }

    @PostMapping("/comments/{commentId}/reports")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public com.example.backend.dto.auth.MessageResponse reportComment(
            @PathVariable UUID commentId,
            @Valid @RequestBody com.example.backend.dto.LegendReportRequest request
    ) {
        commentService.reportComment(commentId, request);
        return new com.example.backend.dto.auth.MessageResponse(
                "Dziękujemy za zgłoszenie komentarza. Moderator je sprawdzi."
        );
    }
}