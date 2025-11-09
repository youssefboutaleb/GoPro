package com.medico.services;

import com.medico.dto.AuthResponseDTO;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.core.Form;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;

// ...existing code...

@ApplicationScoped
public class KeycloakService {
    
    @ConfigProperty(name = "quarkus.oidc.auth-server-url")
    String authServerUrl;
    
    @ConfigProperty(name = "quarkus.oidc.client-id")
    String clientId;
    
    @ConfigProperty(name = "quarkus.oidc.credentials.secret")
    String clientSecret;
    
    private final Client client = ClientBuilder.newClient();
    
    public AuthResponseDTO authenticate(String username, String password) {
        String tokenUrl = authServerUrl + "/protocol/openid-connect/token";
        
        Form form = new Form()
                .param("grant_type", "password")
                .param("username", username)
                .param("password", password)
                .param("client_id", clientId)
                .param("client_secret", clientSecret);
        
        Response response = client.target(tokenUrl)
                .request(MediaType.APPLICATION_JSON)
                .post(Entity.form(form));
        
        if (response.getStatus() == 200) {
            return response.readEntity(AuthResponseDTO.class);
        } else {
            throw new RuntimeException("Authentication failed: " + response.getStatus());
        }
    }
    
    public AuthResponseDTO refreshToken(String refreshToken) {
        String tokenUrl = authServerUrl + "/protocol/openid-connect/token";
        
        Form form = new Form()
                .param("grant_type", "refresh_token")
                .param("refresh_token", refreshToken)
                .param("client_id", clientId)
                .param("client_secret", clientSecret);
        
        Response response = client.target(tokenUrl)
                .request(MediaType.APPLICATION_JSON)
                .post(Entity.form(form));
        
        if (response.getStatus() == 200) {
            return response.readEntity(AuthResponseDTO.class);
        } else {
            throw new RuntimeException("Token refresh failed: " + response.getStatus());
        }
    }
    
    public void logout(String username) {
        // In a real implementation, you might want to invalidate the session
        // For now, we'll just log the logout
        System.out.println("User logged out: " + username);
    }
    
    public boolean validateToken(String token) {
        String introspectUrl = authServerUrl + "/protocol/openid-connect/token/introspect";
        
        Form form = new Form()
                .param("token", token)
                .param("client_id", clientId)
                .param("client_secret", clientSecret);
        
        Response response = client.target(introspectUrl)
                .request(MediaType.APPLICATION_JSON)
                .post(Entity.form(form));
        
        if (response.getStatus() == 200) {
            String responseBody = response.readEntity(String.class);
            return responseBody.contains("\"active\":true");
        }
        
        return false;
    }
}