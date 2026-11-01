CREATE TABLE comment_reports (
                                 id                BINARY(16) PRIMARY KEY,
                                 comment_id        BINARY(16) NOT NULL,
                                 reporter_id       BINARY(16) NULL,
                                 reporter_username VARCHAR(100) NOT NULL,
                                 reason            VARCHAR(40) NOT NULL,
                                 details           VARCHAR(1000) NULL,
                                 status            VARCHAR(20) NOT NULL DEFAULT 'OPEN',
                                 moderation_notes  VARCHAR(2000) NULL,
                                 created_at        DATETIME(6) NOT NULL,
                                 resolved_at       DATETIME(6) NULL,
                                 resolved_by       BINARY(16) NULL,

                                 CONSTRAINT fk_comment_reports_comment
                                     FOREIGN KEY (comment_id) REFERENCES legend_comments(id) ON DELETE CASCADE,
                                 CONSTRAINT fk_comment_reports_reporter
                                     FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL,
                                 CONSTRAINT fk_comment_reports_resolved_by
                                     FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_comment_reports_status_created_at
    ON comment_reports (status, created_at);

CREATE INDEX idx_comment_reports_comment_id
    ON comment_reports (comment_id);