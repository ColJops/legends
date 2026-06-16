CREATE TABLE legends (
                         id BIGINT NOT NULL AUTO_INCREMENT,
                         title VARCHAR(150) NOT NULL,
                         content TEXT NOT NULL,
                         region VARCHAR(50) NOT NULL,
                         city VARCHAR(100) NOT NULL,
                         category VARCHAR(50) NOT NULL,
                         image_url VARCHAR(255),
                         created_at DATETIME(6),
                         updated_at DATETIME(6),
                         PRIMARY KEY (id)
);