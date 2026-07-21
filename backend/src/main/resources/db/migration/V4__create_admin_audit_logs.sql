CREATE TABLE admin_audit_logs
(
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_id       BIGINT       NOT NULL,
    admin_username VARCHAR(100) NOT NULL,
    action         VARCHAR(60)  NOT NULL,
    target_type    VARCHAR(30)  NOT NULL,
    target_id      BIGINT       NULL,
    target_label   VARCHAR(255) NULL,
    details        VARCHAR(2000) NULL,
    created_at     DATETIME(6)  NOT NULL
);

CREATE INDEX idx_audit_created_at
    ON admin_audit_logs (created_at);

CREATE INDEX idx_audit_admin_username
    ON admin_audit_logs (admin_username);

CREATE INDEX idx_audit_action
    ON admin_audit_logs (action);

CREATE INDEX idx_audit_target_type
    ON admin_audit_logs (target_type);