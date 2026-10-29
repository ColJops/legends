package com.example.backend.service;

import com.example.backend.dto.LegendRequest;
import com.example.backend.dto.LegendResponse;
import com.example.backend.dto.LegendStatsResponse;
import com.example.backend.dto.PagedResponse;
import com.example.backend.entity.*;
import com.example.backend.exception.InvalidCityForRegionException;
import com.example.backend.exception.LegendAccessDeniedException;
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
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LegendServiceTest {

    @Mock
    private LegendRepository legendRepository;

    @Mock
    private FileUploadService fileUploadService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AdminAuditService adminAuditService;

    @InjectMocks
    private LegendService legendService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createSavesLegendAsPendingByDefaultForStandardUser() {
        User author = user(uuid(11), "author", Role.USER);
        authenticateAs(author, true);
        LegendRequest request = request("Smok wawelski", "Kraków", null);

        when(legendRepository.save(any(Legend.class))).thenAnswer(invocation -> {
            Legend saved = invocation.getArgument(0);
            saved.setId(uuid(7));
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
                        Legend::getAuthor,
                        Legend::getStatus
                )
                .containsExactly(
                        "Smok wawelski",
                        "Tresc legendy",
                        Region.MALOPOLSKIE,
                        "Kraków",
                        LegendCategory.LEGENDA,
                        null,
                        author,
                        LegendStatus.PENDING
                );
        assertThat(response.id()).isEqualTo(uuid(7));
        assertThat(response.status()).isEqualTo(LegendStatus.PENDING);
    }

    @Test
    void createSavesDraftForUserAndForcesPendingEvenIfPublishedRequested() {
        User author = user(uuid(11), "author", Role.USER);
        authenticateAs(author, true);
        LegendRequest request = request("Smok wawelski", "Kraków", null);

        when(legendRepository.save(any(Legend.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        LegendResponse draftResponse = legendService.create(request, LegendStatus.DRAFT);
        LegendResponse forcedPendingResponse = legendService.create(request, LegendStatus.PUBLISHED);

        assertThat(draftResponse.status()).isEqualTo(LegendStatus.DRAFT);
        assertThat(forcedPendingResponse.status()).isEqualTo(LegendStatus.PENDING);
    }

    @Test
    void createImmediatelyPublishesLegendWhenCreatedByAdmin() {
        User admin = user(uuid(1), "admin", Role.ADMIN);
        authenticateAs(admin, true);
        LegendRequest request = request("Smok wawelski", "Kraków", null);

        when(legendRepository.save(any(Legend.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        LegendResponse response = legendService.create(request, LegendStatus.PENDING);

        assertThat(response.status()).isEqualTo(LegendStatus.PUBLISHED);
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
        when(legendRepository.findById(uuid(99))).thenReturn(Optional.empty());

        assertThatThrownBy(() -> legendService.findById(uuid(99)))
                .isInstanceOf(LegendNotFoundException.class)
                .hasMessage("Legend not found with id: " + uuid(99));
    }

    @Test
    void findByIdHidesUnpublishedLegendFromAnonymousAndOtherUsers() {
        User author = user(uuid(11), "author", Role.USER);
        Legend draftLegend = legend(uuid(15), "Szkic", "Warszawa");
        draftLegend.setAuthor(author);
        draftLegend.setStatus(LegendStatus.DRAFT);

        when(legendRepository.findById(uuid(15))).thenReturn(Optional.of(draftLegend));

        // Niezalogowany użytkownik
        assertThatThrownBy(() -> legendService.findById(uuid(15)))
                .isInstanceOf(LegendNotFoundException.class);

        // Inny zwykły użytkownik
        User stranger = user(uuid(22), "stranger", Role.USER);
        authenticateAs(stranger, false);
        assertThatThrownBy(() -> legendService.findById(uuid(15)))
                .isInstanceOf(LegendNotFoundException.class);
    }

    @Test
    void findByIdAllowsAuthorAndAdminToViewUnpublishedLegend() {
        User author = user(uuid(11), "author", Role.USER);
        Legend pendingLegend = legend(uuid(15), "W moderacji", "Warszawa");
        pendingLegend.setAuthor(author);
        pendingLegend.setStatus(LegendStatus.PENDING);

        when(legendRepository.findById(uuid(15))).thenReturn(Optional.of(pendingLegend));

        authenticateAs(author, false);
        assertThat(legendService.findById(uuid(15)).title()).isEqualTo("W moderacji");

        User admin = user(uuid(1), "admin", Role.ADMIN);
        authenticateAs(admin, false);
        assertThat(legendService.findById(uuid(15)).title()).isEqualTo("W moderacji");
    }

    @Test
    void updateChangesExistingLegendOwnedByCurrentUserAndClearsRejectionMetadata() {
        User author = user(uuid(11), "author", Role.USER);
        authenticateAs(author, true);
        Legend existing = legend(uuid(3), "Stary tytul", "Warszawa");
        existing.setAuthor(author);
        existing.setStatus(LegendStatus.REJECTED);
        existing.setRejectionReason("Brak źródeł");
        existing.setModerationNotes("Do poprawy");
        existing.setModeratedAt(LocalDateTime.now());

        LegendRequest request = new LegendRequest(
                "Nowy tytul",
                "Nowa tresc",
                Region.MAZOWIECKIE,
                "Radom",
                LegendCategory.PODANIE,
                "/image.png"
        );
        when(legendRepository.findById(uuid(3))).thenReturn(Optional.of(existing));
        when(legendRepository.save(existing)).thenReturn(existing);

        LegendResponse response = legendService.update(uuid(3), request, LegendStatus.PENDING);

        assertThat(response)
                .extracting(
                        LegendResponse::title,
                        LegendResponse::content,
                        LegendResponse::city,
                        LegendResponse::category,
                        LegendResponse::imageUrl,
                        LegendResponse::status,
                        LegendResponse::rejectionReason
                )
                .containsExactly(
                        "Nowy tytul",
                        "Nowa tresc",
                        "Radom",
                        LegendCategory.PODANIE,
                        "/image.png",
                        LegendStatus.PENDING,
                        null
                );
        assertThat(existing.getModerationNotes()).isNull();
        assertThat(existing.getModeratedAt()).isNull();
        verify(legendRepository).save(existing);
        verifyNoInteractions(adminAuditService);
    }

    @Test
    void updateForbidsRegularUserFromEditingArchivedLegendOrSomeoneElsesLegend() {
        User author = user(uuid(11), "author", Role.USER);
        User otherUser = user(uuid(22), "other", Role.USER);
        Legend archivedLegend = legend(uuid(3), "Zarchiwizowana", "Warszawa");
        archivedLegend.setAuthor(author);
        archivedLegend.setStatus(LegendStatus.ARCHIVED);

        LegendRequest request = new LegendRequest(
                "Tytul", "Tresc", Region.MAZOWIECKIE, "Warszawa", LegendCategory.LEGENDA, null
        );
        when(legendRepository.findById(uuid(3))).thenReturn(Optional.of(archivedLegend));

        // Właściciel próbuje edytować zarchiwizowaną legendę
        authenticateAs(author, true);
        assertThatThrownBy(() -> legendService.update(uuid(3), request, LegendStatus.PENDING))
                .isInstanceOf(LegendAccessDeniedException.class);

        // Inny użytkownik próbuje edytować cudzą legendę
        authenticateAs(otherUser, true);
        assertThatThrownBy(() -> legendService.update(uuid(3), request, LegendStatus.PENDING))
                .isInstanceOf(LegendAccessDeniedException.class);
    }

    @Test
    void updateAllowsAdminToRestoreArchivedLegendAndRecordsRestoreAuditLog() {
        User admin = user(uuid(1), "admin", Role.ADMIN);
        authenticateAs(admin, true);
        Legend archived = legend(uuid(8), "Zarchiwizowana legenda", "Kraków");
        archived.setStatus(LegendStatus.ARCHIVED);

        LegendRequest request = request("Przywrócona legenda", "Kraków", null);
        when(legendRepository.findById(uuid(8))).thenReturn(Optional.of(archived));
        when(legendRepository.save(archived)).thenReturn(archived);

        LegendResponse response = legendService.update(uuid(8), request, LegendStatus.PUBLISHED);

        assertThat(response.status()).isEqualTo(LegendStatus.PUBLISHED);
        assertThat(archived.getModeratedBy()).isEqualTo(admin);
        assertThat(archived.getModeratedAt()).isNotNull();

        verify(adminAuditService).record(
                AdminAuditAction.LEGEND_RESTORED,
                AdminAuditTargetType.LEGEND,
                uuid(8),
                "Przywrócona legenda",
                "Legenda została przywrócona do publikacji przez administratora"
        );
    }

    @Test
    void updateByAdminOnPublishedLegendRecordsStandardUpdateAuditLog() {
        User admin = user(uuid(1), "admin", Role.ADMIN);
        authenticateAs(admin, true);
        Legend published = legend(uuid(9), "Opublikowana", "Kraków");
        published.setStatus(LegendStatus.PUBLISHED);

        LegendRequest request = request("Zmieniona przez admina", "Kraków", null);
        when(legendRepository.findById(uuid(9))).thenReturn(Optional.of(published));
        when(legendRepository.save(published)).thenReturn(published);

        legendService.update(uuid(9), request, LegendStatus.PUBLISHED);

        verify(adminAuditService).record(
                AdminAuditAction.LEGEND_UPDATED,
                AdminAuditTargetType.LEGEND,
                uuid(9),
                "Zmieniona przez admina",
                "Legenda została zmodyfikowana przez administratora"
        );
    }

    @Test
    void deleteRemovesOwnedLegendAndItsImage() {
        User author = user(uuid(11), "author", Role.USER);
        authenticateAs(author, true);
        Legend existing = legend(uuid(5), "Legenda", "Warszawa");
        existing.setAuthor(author);
        existing.setImageUrl("/uploads/legends/example.png");
        when(legendRepository.findById(uuid(5))).thenReturn(Optional.of(existing));

        legendService.delete(uuid(5));

        verify(legendRepository).delete(existing);
        verify(fileUploadService).deleteLegendImage("/uploads/legends/example.png");
    }

    @Test
    void deleteThrowsAndDoesNotDeleteMissingLegend() {
        when(legendRepository.findById(uuid(5))).thenReturn(Optional.empty());

        assertThatThrownBy(() -> legendService.delete(uuid(5)))
                .isInstanceOf(LegendNotFoundException.class);

        verify(legendRepository, never()).delete(any(Legend.class));
    }

    @Test
    @SuppressWarnings("unchecked")
    void findAllPagedUsesSafePagingAndSorting() {
        Legend legend = legend(uuid(1), "Syrenka", "Warszawa");
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

    @Test
    @SuppressWarnings("unchecked")
    void findMyPagedReturnsCurrentUsersLegends() {
        User author = user(uuid(11), "author", Role.USER);
        authenticateAs(author, true);
        Legend legend = legend(uuid(2), "Moja legenda", "Warszawa");
        legend.setAuthor(author);

        when(legendRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(legend)));

        PagedResponse<LegendResponse> response = legendService.findMyPaged(
                "", null, null, null, 0, 6, "createdAt", "desc"
        );

        assertThat(response.content()).hasSize(1);
        assertThat(response.content().getFirst().title()).isEqualTo("Moja legenda");
    }

    @Test
    void getStatsReturnsPublishedAggregationsByCategoryAndRegion() {
        when(legendRepository.countByCategoryAndStatus(LegendStatus.PUBLISHED))
                .thenReturn(List.<Object[]>of(new Object[]{LegendCategory.LEGENDA, 4L}));
        when(legendRepository.countByRegionAndStatus(LegendStatus.PUBLISHED))
                .thenReturn(List.<Object[]>of(new Object[]{Region.MALOPOLSKIE, 4L}));
        when(legendRepository.countByStatus(LegendStatus.PUBLISHED)).thenReturn(4L);

        LegendStatsResponse stats = legendService.getStats();

        assertThat(stats.totalLegends()).isEqualTo(4L);
        assertThat(stats.byCategory()).containsEntry("LEGENDA", 4L);
        assertThat(stats.byRegion()).containsEntry("MALOPOLSKIE", 4L);
    }

    private void authenticateAs(User user, boolean stubRepositoryLookup) {
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
        if (stubRepositoryLookup) {
            lenient().when(userRepository.findByUsername(user.getUsername()))
                    .thenReturn(Optional.of(user));
        }
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

    private Legend legend(UUID id, String title, String city) {
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

    private User user(UUID id, String username, Role role) {
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

    private static UUID uuid(long value) {
        return UUID.fromString(String.format("00000000-0000-0000-0000-%012d", value));
    }
}