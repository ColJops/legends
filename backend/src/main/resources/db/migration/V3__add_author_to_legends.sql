ALTER TABLE legends
    ADD COLUMN author_id BIGINT NULL;

ALTER TABLE legends
    ADD CONSTRAINT fk_legends_author
        FOREIGN KEY (author_id)
            REFERENCES users(id);