package com.medico.resources;

import com.medico.dto.SalesDTO;
import com.medico.entities.Sales;
import com.medico.repositories.SalesRepository;
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

@Path("/sales")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Sales", description = "Sales data management endpoints")
public class SalesResource {
    
    @Inject
    SalesRepository salesRepository;
    
    @GET
    @Operation(summary = "Get all sales", description = "Retrieve all sales records")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Sales retrieved successfully",
        content = @Content(schema = @Schema(implementation = SalesDTO.class))
    )
    public Response getAllSales() {
        List<Sales> sales = salesRepository.findAllOrdered();
        
        List<SalesDTO> salesDTOs = sales.stream().map(sale -> {
            SalesDTO dto = new SalesDTO();
            dto.setId(sale.getId());
            dto.setYear(sale.getYear());
            dto.setTargets(sale.getTargets());
            dto.setAchievements(sale.getAchievements());
            dto.setSalesPlanId(sale.getSalesPlanId());
            return dto;
        }).collect(Collectors.toList());
        
        return Response.ok(salesDTOs).build();
    }
    
    @GET
    @Path("/{id}")
    @Operation(summary = "Get sales by ID", description = "Retrieve a specific sales record by ID")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Sales retrieved successfully",
        content = @Content(schema = @Schema(implementation = SalesDTO.class))
    )
    @APIResponse(
        responseCode = "404",
        description = "Sales not found"
    )
    public Response getSalesById(@PathParam("id") UUID id) {
        Sales sales = salesRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Sales not found"));
        
        SalesDTO dto = new SalesDTO();
        dto.setId(sales.getId());
        dto.setYear(sales.getYear());
        dto.setTargets(sales.getTargets());
        dto.setAchievements(sales.getAchievements());
        dto.setSalesPlanId(sales.getSalesPlanId());
        
        return Response.ok(dto).build();
    }
    
    @GET
    @Path("/sales-plan/{salesPlanId}")
    @Operation(summary = "Get sales by sales plan", description = "Retrieve all sales records for a specific sales plan")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Sales retrieved successfully",
        content = @Content(schema = @Schema(implementation = SalesDTO.class))
    )
    public Response getSalesBySalesPlan(@PathParam("salesPlanId") UUID salesPlanId) {
        List<Sales> sales = salesRepository.findBySalesPlanId(salesPlanId);
        
        List<SalesDTO> salesDTOs = sales.stream().map(sale -> {
            SalesDTO dto = new SalesDTO();
            dto.setId(sale.getId());
            dto.setYear(sale.getYear());
            dto.setTargets(sale.getTargets());
            dto.setAchievements(sale.getAchievements());
            dto.setSalesPlanId(sale.getSalesPlanId());
            return dto;
        }).collect(Collectors.toList());
        
        return Response.ok(salesDTOs).build();
    }
    
    @POST
    @Transactional
    @Operation(summary = "Create sales", description = "Create a new sales record")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "201",
        description = "Sales created successfully",
        content = @Content(schema = @Schema(implementation = SalesDTO.class))
    )
    public Response createSales(@Valid @RequestBody SalesDTO salesDTO) {
        Sales sales = new Sales();
        sales.setYear(salesDTO.getYear());
        sales.setTargets(salesDTO.getTargets());
        sales.setAchievements(salesDTO.getAchievements());
        sales.setSalesPlanId(salesDTO.getSalesPlanId());
        
        salesRepository.persist(sales);
        
        salesDTO.setId(sales.getId());
        
        return Response.status(Response.Status.CREATED).entity(salesDTO).build();
    }
    
    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Update sales", description = "Update an existing sales record")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Sales updated successfully",
        content = @Content(schema = @Schema(implementation = SalesDTO.class))
    )
    @APIResponse(
        responseCode = "404",
        description = "Sales not found"
    )
    public Response updateSales(@PathParam("id") UUID id, @Valid @RequestBody SalesDTO salesDTO) {
        Sales sales = salesRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Sales not found"));
        
        sales.setYear(salesDTO.getYear());
        sales.setTargets(salesDTO.getTargets());
        sales.setAchievements(salesDTO.getAchievements());
        sales.setSalesPlanId(salesDTO.getSalesPlanId());
        
        salesRepository.persist(sales);
        
        salesDTO.setId(sales.getId());
        
        return Response.ok(salesDTO).build();
    }
    
    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Delete sales", description = "Delete a sales record")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "204",
        description = "Sales deleted successfully"
    )
    @APIResponse(
        responseCode = "404",
        description = "Sales not found"
    )
    public Response deleteSales(@PathParam("id") UUID id) {
        Sales sales = salesRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Sales not found"));
        
        salesRepository.delete(sales);
        return Response.noContent().build();
    }
}

