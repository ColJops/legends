package com.example.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:legends_migration_schema;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=validate",
        "app.upload.dir=${java.io.tmpdir}/legends-migration-test-uploads"
})
@ActiveProfiles("test")
class MigrationSchemaValidationTest {

    @Test
    void flywayMigrationsMatchJpaMappings() {
    }
}
