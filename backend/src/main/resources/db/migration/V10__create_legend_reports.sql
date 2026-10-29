CREATE TABLE legend_reports
(
    id                BINARY(16) PRIMARY KEY,
    legend_id         BINARY(16) NOT NULL,
    reporter_id       BINARY(16) NULL,
    reporter_username VARCHAR(100) NOT NULL,
    reason            VARCHAR(40) NOT NULL,
    details           VARCHAR(1000) NULL,
    status            VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    moderation_notes  VARCHAR(2000) NULL,
    created_at        DATETIME(6) NOT NULL,
    resolved_at       DATETIME(6) NULL,
    resolved_by       BINARY(16) NULL,
    CONSTRAINT fk_legend_reports_legend
        FOREIGN KEY (legend_id) REFERENCES legends(id) ON DELETE CASCADE,
    CONSTRAINT fk_legend_reports_reporter
        FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_legend_reports_resolved_by
        FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_legend_reports_status_created_at
    ON legend_reports (status, created_at);

CREATE INDEX idx_legend_reports_legend_id
    ON legend_reports (legend_id);
