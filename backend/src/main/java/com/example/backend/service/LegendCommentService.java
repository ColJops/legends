package com.example.backend.service;

import com.example.backend.dto.community.CommentRequest;
import com.example.backend.dto.community.CommentResponse;
import com.example.backend.entity.*;
import com.example.backend.exception.AdminOperationNotAllowedException;
import com.example.backend.exception.LegendAccessDeniedException;
import com.example.backend.exception.LegendNotFoundException;
import com.example.backend.repository.LegendCommentRepository;
import com.example.backend.repository.LegendRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LegendCommentService {

    private final LegendCommentRepository commentRepository;
    private final LegendRepository legendRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(UUID legendId) {
        return commentRepository.findByLegend_IdAndParentIsNullOrderByCreatedAtDesc(legendId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CommentResponse addComment(UUID legendId, CommentRequest request) {
        Legend legend = legendRepository.findById(legendId)
                .filter(l -> l.getStatus() == LegendStatus.PUBLISHED)
                .orElseThrow(() -> new LegendNotFoundException(legendId));

        User author = getCurrentUser();

        if (commentRepository.existsByLegend_IdAndAuthor_Id(legendId, author.getId())) {
            throw new AdminOperationNotAllowedException(
                    "Możesz dodać tylko jeden komentarz do tej legendy."
            );
        }

        LegendComment comment = LegendComment.builder()
                .legend(legend)
                .author(author)
                .content(request.content().trim())
                .build();

        return toResponse(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(UUID commentId) {
        LegendComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AdminOperationNotAllowedException("Nie znaleziono komentarza."));
        User currentUser = getCurrentUser();

        if (currentUser.getRole() != Role.ADMIN
                && !comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new LegendAccessDeniedException();
        }

        commentRepository.delete(comment);
    }

    private CommentResponse toResponse(LegendComment c) {
        return new CommentResponse(
                c.getId(),
                c.getLegend().getId(),
                c.getAuthor().getId(),
                c.getAuthor().getUsername(),
                c.getAuthor().getAvatarUrl(),
                c.getContent(),
                c.getCreatedAt()
        );
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }
}
