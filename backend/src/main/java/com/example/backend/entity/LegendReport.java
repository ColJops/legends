package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "legend_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LegendReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "legend_id", nullable = false)
    private Legend legend;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id")
    private User reporter;

    @Column(nullable = false, length = 100)
    private String reporterUsername;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private LegendReportReason reason;

    @Column(length = 1000)
    private String details;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LegendReportStatus status = LegendReportStatus.OPEN;

    @Column(length = 2000)
    private String moderationNotes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = LegendReportStatus.OPEN;
    }
}
