package com.medico.integration.resources;

import io.quarkus.test.common.QuarkusTestResourceLifecycleManager;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.HashMap;
import java.util.Map;

@SuppressWarnings("resource")
public class PostgresTestResource implements QuarkusTestResourceLifecycleManager {

    private PostgreSQLContainer<?> postgres;

    @Override
    public Map<String, String> start() {
        postgres = new PostgreSQLContainer<>("postgres:15-alpine")
                .withDatabaseName("medico")
                .withUsername("medico")
                .withPassword("medico");
        postgres.start();

        Map<String, String> props = new HashMap<>();
        props.put("quarkus.datasource.jdbc.url", postgres.getJdbcUrl());
        props.put("quarkus.datasource.username", postgres.getUsername());
        props.put("quarkus.datasource.password", postgres.getPassword());
    // Ensure Quarkus selects the PostgreSQL driver at runtime
    props.put("quarkus.datasource.db-kind", "postgresql");
    props.put("quarkus.datasource.jdbc.driver", "org.postgresql.Driver");
        // Ensure Flyway runs against the test DB
        props.put("quarkus.flyway.migrate-at-start", "true");
        return props;
    }

    @Override
    public void stop() {
        if (postgres != null) {
            postgres.stop();
        }
    }
}
