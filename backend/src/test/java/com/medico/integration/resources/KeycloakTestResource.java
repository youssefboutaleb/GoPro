package com.medico.integration.resources;

import io.quarkus.test.common.QuarkusTestResourceLifecycleManager;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.utility.MountableFile;

import java.util.HashMap;
import java.util.Map;

@SuppressWarnings("resource")
public class KeycloakTestResource implements QuarkusTestResourceLifecycleManager {

    private GenericContainer<?> keycloak;

    @Override
    public Map<String, String> start() {
        // Start Keycloak in dev mode and import realm from project keycloak/medico-realm.json
        keycloak = new GenericContainer<>("quay.io/keycloak/keycloak:24.0.1")
                .withExposedPorts(8080)
                .withEnv("KEYCLOAK_ADMIN", "admin")
                .withEnv("KEYCLOAK_ADMIN_PASSWORD", "admin")
                .withCommand("start-dev");

        // Copy realm import file from repo (relative path)
        try {
            MountableFile realm = MountableFile.forHostPath("keycloak/medico-realm.json");
            keycloak.withCopyFileToContainer(realm, "/opt/keycloak/data/import/medico-realm.json")
                    .withEnv("KEYCLOAK_IMPORT", "/opt/keycloak/data/import/medico-realm.json");
        } catch (Exception e) {
            // if realm file not found, continue without import
        }

        keycloak.start();
        String base = String.format("http://%s:%d/realms/medico", keycloak.getHost(), keycloak.getMappedPort(8080));

        Map<String, String> props = new HashMap<>();
        props.put("quarkus.oidc.auth-server-url", base);
        props.put("quarkus.oidc.client-id", "medico-backend");
        props.put("quarkus.oidc.credentials.secret", "secret");
        // Keep OIDC enabled
        props.put("quarkus.oidc.enabled", "true");
        return props;
    }

    @Override
    public void stop() {
        if (keycloak != null) {
            keycloak.stop();
        }
    }
}
