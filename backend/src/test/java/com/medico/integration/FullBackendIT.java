package com.medico.integration;

import com.medico.integration.resources.KeycloakTestResource;
import com.medico.integration.resources.PostgresTestResource;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;

@QuarkusTest
@TestProfile(IntegrationTestProfile.class)
@QuarkusTestResource(PostgresTestResource.class)
@QuarkusTestResource(KeycloakTestResource.class)
public class FullBackendIT {

    @Test
    public void healthEndpointShouldReturnUp() {
        given()
          .when().get("/health")
          .then()
            .statusCode(200);
    }
}
