package com.example.backend.service;

import com.example.backend.dto.LegendReportRequest;
import com.example.backend.dto.community.CommentRequest;
import com.example.backend.dto.community.CommentResponse;
import com.example.backend.entity.*;
import com.example.backend.exception.AdminOperationNotAllowedException;
import com.example.backend.exception.LegendAccessDeniedException;
import com.example.backend.repository.CommentReportRepository;
import com.example.backend.repository.LegendCommentRepository;
import com.example.backend.repository.LegendRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LegendCommentServiceTest {

    @Mock
    private LegendCommentRepository commentRepository;

    @Mock
    private LegendRepository legendRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CommentReportRepository commentReportRepository;

    @Mock
    private AdminAuditService adminAuditService;

    @InjectMocks
    private LegendCommentService commentService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void addsCommentWhenUserHasNotCommentedYet() {
        UUID legendId = UUID.randomUUID();
        User author = User.builder()
                .id(UUID.randomUUID())
                .username("testowy")
                .role(Role.USER)
                .build();
        Legend legend = Legend.builder()
                .id(legendId)
                .title("Mapa")
                .status(LegendStatus.PUBLISHED)
                .build();

        authenticate(author);
        when(legendRepository.findById(legendId)).thenReturn(Optional.of(legend));
        when(commentRepository.existsByLegend_IdAndAuthor_Id(legendId, author.getId()))
                .thenReturn(false);
        when(commentRepository.save(any(LegendComment.class))).thenAnswer(inv -> {
            LegendComment saved = inv.getArgument(0);
            saved.setId(UUID.randomUUID());
            saved.setCreatedAt(LocalDateTime.now());
            return saved;
        });

        CommentResponse response = commentService.addComment(
                legendId, new CommentRequest("  Super pomysł!  ")
        );

        assertThat(response.content()).isEqualTo("Super pomysł!");
        assertThat(response.authorUsername()).isEqualTo("testowy");
    }

    @Test
    void rejectsSecondCommentFromSameUserOnSameLegend() {
        UUID legendId = UUID.randomUUID();
        User author = User.builder()
                .id(UUID.randomUUID())
                .username("testowy")
                .role(Role.USER)
                .build();
        Legend legend = Legend.builder()
                .id(legendId)
                .status(LegendStatus.PUBLISHED)
                .build();

        authenticate(author);
        when(legendRepository.findById(legendId)).thenReturn(Optional.of(legend));
        when(commentRepository.existsByLegend_IdAndAuthor_Id(legendId, author.getId()))
                .thenReturn(true);

        assertThatThrownBy(() -> commentService.addComment(
                legendId, new CommentRequest("Drugi komentarz")
        )).isInstanceOf(AdminOperationNotAllowedException.class)
                .hasMessageContaining("tylko jeden komentarz");

        verify(commentRepository, never()).save(any());
    }

    @Test
    void allowsAdminToDeleteSomeoneElsesCommentAndLogsAudit() {
        UUID commentId = UUID.randomUUID();
        User commentAuthor = User.builder().id(UUID.randomUUID()).username("user1").build();
        User admin = User.builder().id(UUID.randomUUID()).username("admin").role(Role.ADMIN).build();
        Legend legend = Legend.builder().id(UUID.randomUUID()).title("Mapa").build();
        LegendComment comment = LegendComment.builder()
                .id(commentId)
                .author(commentAuthor)
                .legend(legend)
                .content("Treść")
                .build();

        authenticate(admin);
        when(commentRepository.findById(commentId)).thenReturn(Optional.of(comment));

        commentService.deleteComment(commentId);

        verify(commentRepository).delete(comment);
        verify(adminAuditService).record(
                eq(AdminAuditAction.COMMENT_DELETED),
                eq(AdminAuditTargetType.COMMENT),
                eq(commentId),
                contains("user1"),
                contains("Mapa")
        );
    }

    @Test
    void forbidsOtherRegularUserFromDeletingComment() {
        UUID commentId = UUID.randomUUID();
        User commentAuthor = User.builder().id(UUID.randomUUID()).username("user1").build();
        User stranger = User.builder().id(UUID.randomUUID()).username("user2").role(Role.USER).build();
        LegendComment comment = LegendComment.builder()
                .id(commentId)
                .author(commentAuthor)
                .build();

        authenticate(stranger);
        when(commentRepository.findById(commentId)).thenReturn(Optional.of(comment));

        assertThatThrownBy(() -> commentService.deleteComment(commentId))
                .isInstanceOf(LegendAccessDeniedException.class);
    }

    @Test
    void reportsSomeoneElsesCommentAndForbidsReportingOwnComment() {
        UUID commentId = UUID.randomUUID();
        User commentAuthor = User.builder().id(UUID.randomUUID()).username("user1").build();
        User reporter = User.builder().id(UUID.randomUUID()).username("coljops").build();
        LegendComment comment = LegendComment.builder()
                .id(commentId)
                .author(commentAuthor)
                .build();

        when(commentRepository.findById(commentId)).thenReturn(Optional.of(comment));

        // Próba zgłoszenia własnego komentarza
        authenticate(commentAuthor);
        assertThatThrownBy(() -> commentService.reportComment(
                commentId, new LegendReportRequest(LegendReportReason.SPAM, null)
        )).isInstanceOf(LegendAccessDeniedException.class);

        // Poprawne zgłoszenie przez innego użytkownika
        authenticate(reporter);
        when(commentReportRepository.existsByComment_IdAndReporter_IdAndStatus(
                commentId, reporter.getId(), LegendReportStatus.OPEN
        )).thenReturn(false);

        commentService.reportComment(
                commentId, new LegendReportRequest(LegendReportReason.SPAM, "  Spam  ")
        );

        ArgumentCaptor<CommentReport> captor = ArgumentCaptor.forClass(CommentReport.class);
        verify(commentReportRepository).save(captor.capture());
        assertThat(captor.getValue().getReporterUsername()).isEqualTo("coljops");
        assertThat(captor.getValue().getDetails()).isEqualTo("Spam");
    }

    private void authenticate(User user) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user.getUsername(), null, List.of())
        );
        lenient().when(userRepository.findByUsername(user.getUsername()))
                .thenReturn(Optional.of(user));
    }
}