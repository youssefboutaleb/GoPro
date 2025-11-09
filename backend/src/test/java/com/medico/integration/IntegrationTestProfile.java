package com.medico.integration;

import io.quarkus.test.junit.QuarkusTestProfile;

public class IntegrationTestProfile implements QuarkusTestProfile {
    @Override
    public String getConfigProfile() {
        return "integration-test";
    }
}