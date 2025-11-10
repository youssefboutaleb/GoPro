package com.medico.resources;

import com.medico.dto.SectorDTO;
import com.medico.entities.Sector;
import com.medico.repositories.SectorRepository;
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

@Path("/sectors")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Sectors", description = "Sector management endpoints")
public class SectorResource {
    
    @Inject
    SectorRepository sectorRepository;
    
    @GET
    @Operation(summary = "Get all sectors", description = "Retrieve all sectors")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Sectors retrieved successfully",
        content = @Content(schema = @Schema(implementation = SectorDTO.class))
    )
    public Response getAllSectors() {
        List<Sector> sectors = sectorRepository.findAllOrdered();
        
        List<SectorDTO> sectorDTOs = sectors.stream().map(sector -> {
            SectorDTO dto = new SectorDTO();
            dto.setId(sector.getId());
            dto.setName(sector.getName());
            return dto;
        }).collect(Collectors.toList());
        
        return Response.ok(sectorDTOs).build();
    }
    
    @GET
    @Path("/{id}")
    @Operation(summary = "Get sector by ID", description = "Retrieve a specific sector by ID")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Sector retrieved successfully",
        content = @Content(schema = @Schema(implementation = SectorDTO.class))
    )
    @APIResponse(
        responseCode = "404",
        description = "Sector not found"
    )
    public Response getSectorById(@PathParam("id") UUID id) {
        Sector sector = sectorRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Sector not found"));
        
        SectorDTO dto = new SectorDTO();
        dto.setId(sector.getId());
        dto.setName(sector.getName());
        
        return Response.ok(dto).build();
    }
    
    @POST
    @Transactional
    @Operation(summary = "Create sector", description = "Create a new sector")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "201",
        description = "Sector created successfully",
        content = @Content(schema = @Schema(implementation = SectorDTO.class))
    )
    public Response createSector(@Valid @RequestBody SectorDTO sectorDTO) {
        Sector sector = new Sector();
        sector.setName(sectorDTO.getName());
        
        sectorRepository.persist(sector);
        
        sectorDTO.setId(sector.getId());
        
        return Response.status(Response.Status.CREATED).entity(sectorDTO).build();
    }
    
    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Update sector", description = "Update an existing sector")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Sector updated successfully",
        content = @Content(schema = @Schema(implementation = SectorDTO.class))
    )
    @APIResponse(
        responseCode = "404",
        description = "Sector not found"
    )
    public Response updateSector(@PathParam("id") UUID id, @Valid @RequestBody SectorDTO sectorDTO) {
        Sector sector = sectorRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Sector not found"));
        
        sector.setName(sectorDTO.getName());
        
        sectorRepository.persist(sector);
        
        sectorDTO.setId(sector.getId());
        
        return Response.ok(sectorDTO).build();
    }
    
    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Delete sector", description = "Delete a sector")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "204",
        description = "Sector deleted successfully"
    )
    @APIResponse(
        responseCode = "404",
        description = "Sector not found"
    )
    public Response deleteSector(@PathParam("id") UUID id) {
        Sector sector = sectorRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Sector not found"));
        
        sectorRepository.delete(sector);
        return Response.noContent().build();
    }
}

