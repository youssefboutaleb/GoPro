# Backend Build & Testing Guide

## Building the Quarkus Backend

### Prerequisites
- Docker & Docker Compose installed
- Java 17 (Eclipse Temurin recommended)
- Maven (if building outside Docker)

### Build with Docker Compose
```sh
cd backend
# Build and start all services (Quarkus, Postgres, Keycloak)
docker-compose up --build
```

### Build Locally (without Docker)
```sh
cd backend
mvn clean package -DskipTests
```

## Running Unit Tests

Quarkus uses JUnit 5 for unit testing. Test classes are typically placed in `src/test/java`.

### Run All Unit Tests
```sh
cd backend
mvn test
```

### Example Unit Test (src/test/java/com/medico/resources/HealthResourceTest.java)
```java
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;
import static io.restassured.RestAssured.given;

@QuarkusTest
public class HealthResourceTest {
    @Test
    public void testHealthEndpoint() {
        given()
          .when().get("/health")
          .then()
             .statusCode(200);
    }
}
```

## Running Integration Tests

Integration tests can use QuarkusTest with real or test containers. Place them in `src/test/java`.

### Run Integration Tests
```sh
cd backend
mvn -P integration-tests verify
```

### Example Integration Test (src/test/java/com/medico/resources/VisitResourceIT.java)
```java
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;
import static io.restassured.RestAssured.given;

@QuarkusTest
public class VisitResourceIT {
    @Test
    public void testVisitEndpoint() {
        given()
          .when().get("/visits")
          .then()
             .statusCode(200);
    }
}
```

## Useful Maven Commands
- `mvn clean package` – Build the application
- `mvn test` – Run unit tests
- `mvn verify` – Run integration tests

## Notes
- For integration tests, ensure Postgres and Keycloak are running (use Docker Compose).
 - For integration tests you can either:
    - Run the `integration-tests` Maven profile which will start the `docker-compose.yml` stack before tests and tear it down afterwards:

```sh
cd backend
mvn -P integration-tests verify
```

    - Or start the compose stack manually and run `mvn verify`:

```sh
cd backend
docker compose up -d
mvn verify
docker compose down
```
- You can add more tests for each resource/service in `src/test/java/com/medico/resources/` and `src/test/java/com/medico/services/`.
- For REST endpoints, use RestAssured for HTTP assertions.

---
_This guide helps you build, unit test, and integration test your Quarkus backend._
