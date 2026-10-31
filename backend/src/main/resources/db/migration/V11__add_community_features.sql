-- 1. Rozbudowa tabeli użytkowników o widoczność profilu i avatar
ALTER TABLE users
    ADD COLUMN public_profile BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN avatar_url VARCHAR(500) NULL;

-- 2. Tabela komentarzy (z przygotowanym parent_id pod przyszłe zagnieżdżanie)
CREATE TABLE legend_comments (
                                 id          BINARY(16) PRIMARY KEY,
                                 legend_id   BINARY(16) NOT NULL,
                                 author_id   BINARY(16) NOT NULL,
                                 parent_id   BINARY(16) NULL,
                                 content     VARCHAR(2000) NOT NULL,
                                 created_at  DATETIME(6) NOT NULL,
                                 updated_at  DATETIME(6) NULL,

                                 CONSTRAINT uk_legend_comments_legend_author
                                     UNIQUE (legend_id, author_id),
                                 CONSTRAINT fk_legend_comments_legend
                                     FOREIGN KEY (legend_id) REFERENCES legends(id) ON DELETE CASCADE,
                                 CONSTRAINT fk_legend_comments_author
                                     FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
                                 CONSTRAINT fk_legend_comments_parent
                                     FOREIGN KEY (parent_id) REFERENCES legend_comments(id) ON DELETE CASCADE
);

CREATE INDEX idx_legend_comments_legend_created
    ON legend_comments (legend_id, created_at DESC);

-- 3. Tabela ocen (1-5 gwiazdek, 1 głos na użytkownika i legendę)
CREATE TABLE legend_ratings (
                                id          BINARY(16) PRIMARY KEY,
                                legend_id   BINARY(16) NOT NULL,
                                user_id     BINARY(16) NOT NULL,
                                rating      TINYINT NOT NULL,
                                created_at  DATETIME(6) NOT NULL,

                                CONSTRAINT uk_legend_ratings_legend_user
                                    UNIQUE (legend_id, user_id),
                                CONSTRAINT chk_legend_ratings_range
                                    CHECK (rating BETWEEN 1 AND 5),
                                CONSTRAINT fk_legend_ratings_legend
                                    FOREIGN KEY (legend_id) REFERENCES legends(id) ON DELETE CASCADE,
                                CONSTRAINT fk_legend_ratings_user
                                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_legend_ratings_legend
    ON legend_ratings (legend_id);

-- 4. Tabela ulubionych legend
CREATE TABLE favorite_legends (
                                  user_id     BINARY(16) NOT NULL,
                                  legend_id   BINARY(16) NOT NULL,
                                  created_at  DATETIME(6) NOT NULL,

                                  PRIMARY KEY (user_id, legend_id),
                                  CONSTRAINT fk_favorite_legends_user
                                      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                  CONSTRAINT fk_favorite_legends_legend
                                      FOREIGN KEY (legend_id) REFERENCES legends(id) ON DELETE CASCADE
);

CREATE INDEX idx_favorite_legends_user_created
    ON favorite_legends (user_id, created_at DESC);