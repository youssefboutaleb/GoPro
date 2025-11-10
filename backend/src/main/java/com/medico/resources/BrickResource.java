package com.medico.resources;

import com.medico.dto.BrickDTO;
import com.medico.entities.Brick;
import com.medico.repositories.BrickRepository;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
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

@Path("/bricks")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Bricks", description = "Brick management endpoints")
public class BrickResource {
    
    @Inject
    BrickRepository brickRepository;
    
    @GET
    @Operation(summary = "Get all bricks", description = "Retrieve all bricks")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Bricks retrieved successfully",
        content = @Content(schema = @Schema(implementation = BrickDTO.class))
    )
    public Response getAllBricks() {
        List<Brick> bricks = brickRepository.findAllOrdered();
        
        List<BrickDTO> brickDTOs = bricks.stream().map(brick -> {
            BrickDTO dto = new BrickDTO();
            dto.setId(brick.getId());
            dto.setName(brick.getName());
            dto.setSectorId(brick.getSectorId());
            return dto;
        }).collect(Collectors.toList());
        
        return Response.ok(brickDTOs).build();
    }
    
    @GET
    @Path("/{id}")
    @Operation(summary = "Get brick by ID", description = "Retrieve a specific brick by ID")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Brick retrieved successfully",
        content = @Content(schema = @Schema(implementation = BrickDTO.class))
    )
    @APIResponse(
        responseCode = "404",
        description = "Brick not found"
    )
    public Response getBrickById(@PathParam("id") UUID id) {
        Brick brick = brickRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Brick not found"));
        
        BrickDTO dto = new BrickDTO();
        dto.setId(brick.getId());
        dto.setName(brick.getName());
        dto.setSectorId(brick.getSectorId());
        
        return Response.ok(dto).build();
    }
    
    @GET
    @Path("/sector/{sectorId}")
    @Operation(summary = "Get bricks by sector", description = "Retrieve all bricks for a specific sector")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Bricks retrieved successfully",
        content = @Content(schema = @Schema(implementation = BrickDTO.class))
    )
    public Response getBricksBySector(@PathParam("sectorId") UUID sectorId) {
        List<Brick> bricks = brickRepository.findBySectorId(sectorId);
        
        List<BrickDTO> brickDTOs = bricks.stream().map(brick -> {
            BrickDTO dto = new BrickDTO();
            dto.setId(brick.getId());
            dto.setName(brick.getName());
            dto.setSectorId(brick.getSectorId());
            return dto;
        }).collect(Collectors.toList());
        
        return Response.ok(brickDTOs).build();
    }
    
    @POST
    @Transactional
    @Operation(summary = "Create brick", description = "Create a new brick")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "201",
        description = "Brick created successfully",
        content = @Content(schema = @Schema(implementation = BrickDTO.class))
    )
    public Response createBrick(@Valid @RequestBody BrickDTO brickDTO) {
        Brick brick = new Brick();
        brick.setName(brickDTO.getName());
        brick.setSectorId(brickDTO.getSectorId());
        
        brickRepository.persist(brick);
        
        brickDTO.setId(brick.getId());
        
        return Response.status(Response.Status.CREATED).entity(brickDTO).build();
    }
    
    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Update brick", description = "Update an existing brick")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Brick updated successfully",
        content = @Content(schema = @Schema(implementation = BrickDTO.class))
    )
    @APIResponse(
        responseCode = "404",
        description = "Brick not found"
    )
    public Response updateBrick(@PathParam("id") UUID id, @Valid @RequestBody BrickDTO brickDTO) {
        Brick brick = brickRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Brick not found"));
        
        brick.setName(brickDTO.getName());
        brick.setSectorId(brickDTO.getSectorId());
        
        brickRepository.persist(brick);
        
        brickDTO.setId(brick.getId());
        
        return Response.ok(brickDTO).build();
    }
    
    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Delete brick", description = "Delete a brick")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "204",
        description = "Brick deleted successfully"
    )
    @APIResponse(
        responseCode = "404",
        description = "Brick not found"
    )
    public Response deleteBrick(@PathParam("id") UUID id) {
        Brick brick = brickRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Brick not found"));
        
        brickRepository.delete(brick);
        return Response.noContent().build();
    }
}

