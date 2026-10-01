-- Reconciles account-status columns for both fresh installations and
-- databases where these columns were previously created outside Flyway.

SET @enabled_column_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND column_name = 'enabled'
);

SET @add_enabled_column = IF(
    @enabled_column_exists = 0,
    'ALTER TABLE users ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT TRUE',
    'SELECT 1'
);

PREPARE add_enabled_statement FROM @add_enabled_column;
EXECUTE add_enabled_statement;
DEALLOCATE PREPARE add_enabled_statement;

SET @locked_column_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND column_name = 'locked'
);

SET @add_locked_column = IF(
    @locked_column_exists = 0,
    'ALTER TABLE users ADD COLUMN locked BOOLEAN NOT NULL DEFAULT FALSE',
    'SELECT 1'
);

PREPARE add_locked_statement FROM @add_locked_column;
EXECUTE add_locked_statement;
DEALLOCATE PREPARE add_locked_statement;

-- Existing accounts remain usable. New accounts are inactive by default.
UPDATE users SET enabled = TRUE WHERE enabled IS NULL;
UPDATE users SET locked = FALSE WHERE locked IS NULL;

ALTER TABLE users
    MODIFY COLUMN enabled BOOLEAN NOT NULL DEFAULT FALSE,
    MODIFY COLUMN locked BOOLEAN NOT NULL DEFAULT FALSE;
