ALTER TABLE legends
    ADD COLUMN publication_status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    ADD COLUMN rejection_reason VARCHAR(1000) NULL,
    ADD COLUMN moderation_notes VARCHAR(2000) NULL,
    ADD COLUMN moderated_at DATETIME(6) NULL,
    ADD COLUMN moderated_by BINARY(16) NULL;

ALTER TABLE legends
    ADD CONSTRAINT fk_legends_moderated_by
        FOREIGN KEY (moderated_by) REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_legends_publication_status_created_at
    ON legends (publication_status, created_at);
