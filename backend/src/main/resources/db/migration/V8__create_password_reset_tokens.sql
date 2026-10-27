CREATE TABLE password_reset_tokens (
    id BINARY(16) PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expires_at TIMESTAMP(6) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,

    CONSTRAINT uk_password_reset_tokens_user
        UNIQUE (user_id),
    CONSTRAINT uk_password_reset_tokens_hash
        UNIQUE (token_hash),
    CONSTRAINT fk_password_reset_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_password_reset_tokens_expires_at
    ON password_reset_tokens (expires_at);
