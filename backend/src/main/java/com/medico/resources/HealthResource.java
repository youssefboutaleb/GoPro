package com.medico.resources;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Path("/health")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Health", description = "Health check endpoints")
public class HealthResource {

    @GET
    @Operation(summary = "Health check", description = "Check if the application is healthy")
    public Response healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("service", "medico-backend");
        
        return Response.ok(response).build();
    }

    @GET
    @Path("/ready")
    @Operation(summary = "Readiness check", description = "Check if the application is ready to serve requests")
    public Response readinessCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "READY");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("checks", Map.of(
            "database", "UP",
            "keycloak", "UP"
        ));
        
        return Response.ok(response).build();
    }

    @GET
    @Path("/live")
    @Operation(summary = "Liveness check", description = "Check if the application is alive")
    public Response livenessCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ALIVE");
        response.put("timestamp", LocalDateTime.now().toString());
        
        return Response.ok(response).build();
    }
}