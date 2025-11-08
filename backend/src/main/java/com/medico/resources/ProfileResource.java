package com.medico.resources;

import com.medico.dto.ProfileDTO;
import com.medico.entities.Profile;
import com.medico.entities.RoleType;
import com.medico.repositories.ProfileRepository;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
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

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Path("/profiles")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Profiles", description = "User profile management endpoints")
public class ProfileResource {
    
    @Inject
    ProfileRepository profileRepository;
    
    @GET
    @Operation(summary = "Get all profiles", description = "Retrieve all user profiles")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Profiles retrieved successfully",
        content = @Content(schema = @Schema(implementation = ProfileDTO.class))
    )
    public Response getAllProfiles() {
        List<Profile> profiles = profileRepository.listAll();
        
        List<ProfileDTO> profileDTOs = profiles.stream().map(profile -> {
            ProfileDTO dto = new ProfileDTO();
            dto.setId(profile.getId());
            dto.setFirstName(profile.getFirstName());
            dto.setLastName(profile.getLastName());
            dto.setRole(profile.getRole());
            dto.setSectorId(profile.getSectorId());
            dto.setSupervisorId(profile.getSupervisorId());
            dto.setCreatedAt(profile.getCreatedAt());
            dto.setUpdatedAt(profile.getUpdatedAt());
            return dto;
        }).collect(Collectors.toList());
        
        return Response.ok(profileDTOs).build();
    }
    
    @GET
    @Path("/{id}")
    @Operation(summary = "Get profile by ID", description = "Retrieve a specific user profile by ID")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Profile retrieved successfully",
        content = @Content(schema = @Schema(implementation = ProfileDTO.class))
    )
    @APIResponse(
        responseCode = "404",
        description = "Profile not found"
    )
    public Response getProfileById(@PathParam("id") UUID id) {
        Profile profile = profileRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Profile not found"));
        
        ProfileDTO dto = new ProfileDTO();
        dto.setId(profile.getId());
        dto.setFirstName(profile.getFirstName());
        dto.setLastName(profile.getLastName());
        dto.setRole(profile.getRole());
        dto.setSectorId(profile.getSectorId());
        dto.setSupervisorId(profile.getSupervisorId());
        dto.setCreatedAt(profile.getCreatedAt());
        dto.setUpdatedAt(profile.getUpdatedAt());
        
        return Response.ok(dto).build();
    }
    
    @GET
    @Path("/role/{role}")
    @Operation(summary = "Get profiles by role", description = "Retrieve all profiles with a specific role")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Profiles retrieved successfully",
        content = @Content(schema = @Schema(implementation = ProfileDTO.class))
    )
    public Response getProfilesByRole(@PathParam("role") RoleType role) {
        List<Profile> profiles = profileRepository.findByRole(role);
        
        List<ProfileDTO> profileDTOs = profiles.stream().map(profile -> {
            ProfileDTO dto = new ProfileDTO();
            dto.setId(profile.getId());
            dto.setFirstName(profile.getFirstName());
            dto.setLastName(profile.getLastName());
            dto.setRole(profile.getRole());
            dto.setSectorId(profile.getSectorId());
            dto.setSupervisorId(profile.getSupervisorId());
            dto.setCreatedAt(profile.getCreatedAt());
            dto.setUpdatedAt(profile.getUpdatedAt());
            return dto;
        }).collect(Collectors.toList());
        
        return Response.ok(profileDTOs).build();
    }
    
    @GET
    @Path("/supervisor/{supervisorId}")
    @Operation(summary = "Get profiles by supervisor", description = "Retrieve all profiles supervised by a specific user")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Profiles retrieved successfully",
        content = @Content(schema = @Schema(implementation = ProfileDTO.class))
    )
    public Response getProfilesBySupervisor(@PathParam("supervisorId") UUID supervisorId) {
        List<Profile> profiles = profileRepository.findBySupervisorId(supervisorId);
        
        List<ProfileDTO> profileDTOs = profiles.stream().map(profile -> {
            ProfileDTO dto = new ProfileDTO();
            dto.setId(profile.getId());
            dto.setFirstName(profile.getFirstName());
            dto.setLastName(profile.getLastName());
            dto.setRole(profile.getRole());
            dto.setSectorId(profile.getSectorId());
            dto.setSupervisorId(profile.getSupervisorId());
            dto.setCreatedAt(profile.getCreatedAt());
            dto.setUpdatedAt(profile.getUpdatedAt());
            return dto;
        }).collect(Collectors.toList());
        
        return Response.ok(profileDTOs).build();
    }
    
    @POST
    @Transactional
    @Operation(summary = "Create profile", description = "Create a new user profile")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "201",
        description = "Profile created successfully",
        content = @Content(schema = @Schema(implementation = ProfileDTO.class))
    )
    public Response createProfile(@Valid @RequestBody ProfileDTO profileDTO, @Context SecurityContext securityContext) {
        Profile profile = new Profile();
        profile.setFirstName(profileDTO.getFirstName());
        profile.setLastName(profileDTO.getLastName());
        profile.setRole(profileDTO.getRole());
        profile.setSectorId(profileDTO.getSectorId());
        profile.setSupervisorId(profileDTO.getSupervisorId());
        
        profileRepository.persist(profile);
        
        profileDTO.setId(profile.getId());
        profileDTO.setCreatedAt(profile.getCreatedAt());
        profileDTO.setUpdatedAt(profile.getUpdatedAt());
        
        return Response.status(Response.Status.CREATED).entity(profileDTO).build();
    }
    
    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Update profile", description = "Update an existing user profile")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Profile updated successfully",
        content = @Content(schema = @Schema(implementation = ProfileDTO.class))
    )
    @APIResponse(
        responseCode = "404",
        description = "Profile not found"
    )
    public Response updateProfile(@PathParam("id") UUID id, @Valid @RequestBody ProfileDTO profileDTO) {
        Profile profile = profileRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Profile not found"));
        
        profile.setFirstName(profileDTO.getFirstName());
        profile.setLastName(profileDTO.getLastName());
        profile.setRole(profileDTO.getRole());
        profile.setSectorId(profileDTO.getSectorId());
        profile.setSupervisorId(profileDTO.getSupervisorId());
        
        profileRepository.persist(profile);
        
        profileDTO.setId(profile.getId());
        profileDTO.setCreatedAt(profile.getCreatedAt());
        profileDTO.setUpdatedAt(profile.getUpdatedAt());
        
        return Response.ok(profileDTO).build();
    }
    
    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Delete profile", description = "Delete a user profile")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "204",
        description = "Profile deleted successfully"
    )
    @APIResponse(
        responseCode = "404",
        description = "Profile not found"
    )
    public Response deleteProfile(@PathParam("id") UUID id) {
        Profile profile = profileRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Profile not found"));
        
        profileRepository.delete(profile);
        return Response.noContent().build();
    }
}