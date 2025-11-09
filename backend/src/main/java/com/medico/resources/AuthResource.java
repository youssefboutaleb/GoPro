package com.medico.resources;

import com.medico.dto.AuthRequestDTO;
import com.medico.dto.AuthResponseDTO;
import com.medico.dto.ProfileDTO;
import com.medico.entities.Profile;
import com.medico.repositories.ProfileRepository;
import com.medico.services.KeycloakService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.RequestBody;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

// ...existing code...

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Authentication", description = "Authentication and user management endpoints")
public class AuthResource {
    
    @Inject
    KeycloakService keycloakService;
    
    @Inject
    ProfileRepository profileRepository;
    
    @POST
    @Path("/login")
    @Operation(summary = "User login", description = "Authenticate user with Keycloak and return access token")
    @APIResponse(
        responseCode = "200",
        description = "Authentication successful",
        content = @Content(schema = @Schema(implementation = AuthResponseDTO.class))
    )
    @APIResponse(
        responseCode = "401",
        description = "Invalid credentials"
    )
    public Response login(@Valid @RequestBody AuthRequestDTO authRequest) {
        try {
            AuthResponseDTO response = keycloakService.authenticate(authRequest.getEmail(), authRequest.getPassword());
            
            // Get user profile from database
            Profile profile = profileRepository.find("firstName = ?1 and lastName = ?2", 
                authRequest.getEmail().split("@")[0], "").firstResult();
            
            if (profile != null) {
                ProfileDTO profileDTO = new ProfileDTO();
                profileDTO.setId(profile.getId());
                profileDTO.setFirstName(profile.getFirstName());
                profileDTO.setLastName(profile.getLastName());
                profileDTO.setRole(profile.getRole());
                profileDTO.setSectorId(profile.getSectorId());
                profileDTO.setSupervisorId(profile.getSupervisorId());
                profileDTO.setCreatedAt(profile.getCreatedAt());
                profileDTO.setUpdatedAt(profile.getUpdatedAt());
                
                response.setProfile(profileDTO);
            }
            
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\": \"Invalid credentials\"}")
                    .build();
        }
    }
    
    @POST
    @Path("/refresh")
    @Operation(summary = "Refresh token", description = "Refresh access token using refresh token")
    @APIResponse(
        responseCode = "200",
        description = "Token refreshed successfully",
        content = @Content(schema = @Schema(implementation = AuthResponseDTO.class))
    )
    public Response refreshToken(@FormParam("refresh_token") String refreshToken) {
        try {
            AuthResponseDTO response = keycloakService.refreshToken(refreshToken);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\": \"Invalid refresh token\"}")
                    .build();
        }
    }
    
    @POST
    @Path("/logout")
    @Operation(summary = "User logout", description = "Invalidate user session")
    @SecurityRequirement(name = "SecurityScheme")
    public Response logout(@Context SecurityContext securityContext) {
        String username = securityContext.getUserPrincipal().getName();
        keycloakService.logout(username);
        return Response.ok().build();
    }
    
    @GET
    @Path("/me")
    @Operation(summary = "Get current user", description = "Get current authenticated user's profile")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "User profile retrieved successfully",
        content = @Content(schema = @Schema(implementation = ProfileDTO.class))
    )
    public Response getCurrentUser(@Context SecurityContext securityContext) {
        String username = securityContext.getUserPrincipal().getName();
        
        Profile profile = profileRepository.find("firstName = ?1 and lastName = ?2", 
            username.split("@")[0], "").firstResult();
        
        if (profile == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\": \"Profile not found\"}")
                    .build();
        }
        
        ProfileDTO profileDTO = new ProfileDTO();
        profileDTO.setId(profile.getId());
        profileDTO.setFirstName(profile.getFirstName());
        profileDTO.setLastName(profile.getLastName());
        profileDTO.setRole(profile.getRole());
        profileDTO.setSectorId(profile.getSectorId());
        profileDTO.setSupervisorId(profile.getSupervisorId());
        profileDTO.setCreatedAt(profile.getCreatedAt());
        profileDTO.setUpdatedAt(profile.getUpdatedAt());
        
        return Response.ok(profileDTO).build();
    }
}