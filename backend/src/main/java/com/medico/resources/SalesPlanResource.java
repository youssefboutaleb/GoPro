package com.medico.resources;

import com.medico.dto.SalesPlanDTO;
import com.medico.entities.SalesPlan;
import com.medico.repositories.SalesPlanRepository;
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

@Path("/sales-plans")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Sales Plans", description = "Sales plan management endpoints")
public class SalesPlanResource {
    
    @Inject
    SalesPlanRepository salesPlanRepository;
    
    @GET
    @Operation(summary = "Get all sales plans", description = "Retrieve all sales plans")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Sales plans retrieved successfully",
        content = @Content(schema = @Schema(implementation = SalesPlanDTO.class))
    )
    public Response getAllSalesPlans() {
        List<SalesPlan> salesPlans = salesPlanRepository.findAllOrdered();
        
        List<SalesPlanDTO> salesPlanDTOs = salesPlans.stream().map(salesPlan -> {
            SalesPlanDTO dto = new SalesPlanDTO();
            dto.setId(salesPlan.getId());
            dto.setDelegateId(salesPlan.getDelegateId());
            dto.setProductId(salesPlan.getProductId());
            dto.setBrickId(salesPlan.getBrickId());
            return dto;
        }).collect(Collectors.toList());
        
        return Response.ok(salesPlanDTOs).build();
    }
    
    @GET
    @Path("/{id}")
    @Operation(summary = "Get sales plan by ID", description = "Retrieve a specific sales plan by ID")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Sales plan retrieved successfully",
        content = @Content(schema = @Schema(implementation = SalesPlanDTO.class))
    )
    @APIResponse(
        responseCode = "404",
        description = "Sales plan not found"
    )
    public Response getSalesPlanById(@PathParam("id") UUID id) {
        SalesPlan salesPlan = salesPlanRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Sales plan not found"));
        
        SalesPlanDTO dto = new SalesPlanDTO();
        dto.setId(salesPlan.getId());
        dto.setDelegateId(salesPlan.getDelegateId());
        dto.setProductId(salesPlan.getProductId());
        dto.setBrickId(salesPlan.getBrickId());
        
        return Response.ok(dto).build();
    }
    
    @GET
    @Path("/delegate/{delegateId}")
    @Operation(summary = "Get sales plans by delegate", description = "Retrieve all sales plans for a specific delegate")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Sales plans retrieved successfully",
        content = @Content(schema = @Schema(implementation = SalesPlanDTO.class))
    )
    public Response getSalesPlansByDelegate(@PathParam("delegateId") UUID delegateId) {
        List<SalesPlan> salesPlans = salesPlanRepository.findByDelegateId(delegateId);
        
        List<SalesPlanDTO> salesPlanDTOs = salesPlans.stream().map(salesPlan -> {
            SalesPlanDTO dto = new SalesPlanDTO();
            dto.setId(salesPlan.getId());
            dto.setDelegateId(salesPlan.getDelegateId());
            dto.setProductId(salesPlan.getProductId());
            dto.setBrickId(salesPlan.getBrickId());
            return dto;
        }).collect(Collectors.toList());
        
        return Response.ok(salesPlanDTOs).build();
    }
    
    @POST
    @Transactional
    @Operation(summary = "Create sales plan", description = "Create a new sales plan")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "201",
        description = "Sales plan created successfully",
        content = @Content(schema = @Schema(implementation = SalesPlanDTO.class))
    )
    public Response createSalesPlan(@Valid @RequestBody SalesPlanDTO salesPlanDTO) {
        SalesPlan salesPlan = new SalesPlan();
        salesPlan.setDelegateId(salesPlanDTO.getDelegateId());
        salesPlan.setProductId(salesPlanDTO.getProductId());
        salesPlan.setBrickId(salesPlanDTO.getBrickId());
        
        salesPlanRepository.persist(salesPlan);
        
        salesPlanDTO.setId(salesPlan.getId());
        
        return Response.status(Response.Status.CREATED).entity(salesPlanDTO).build();
    }
    
    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Update sales plan", description = "Update an existing sales plan")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Sales plan updated successfully",
        content = @Content(schema = @Schema(implementation = SalesPlanDTO.class))
    )
    @APIResponse(
        responseCode = "404",
        description = "Sales plan not found"
    )
    public Response updateSalesPlan(@PathParam("id") UUID id, @Valid @RequestBody SalesPlanDTO salesPlanDTO) {
        SalesPlan salesPlan = salesPlanRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Sales plan not found"));
        
        salesPlan.setDelegateId(salesPlanDTO.getDelegateId());
        salesPlan.setProductId(salesPlanDTO.getProductId());
        salesPlan.setBrickId(salesPlanDTO.getBrickId());
        
        salesPlanRepository.persist(salesPlan);
        
        salesPlanDTO.setId(salesPlan.getId());
        
        return Response.ok(salesPlanDTO).build();
    }
    
    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Delete sales plan", description = "Delete a sales plan")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "204",
        description = "Sales plan deleted successfully"
    )
    @APIResponse(
        responseCode = "404",
        description = "Sales plan not found"
    )
    public Response deleteSalesPlan(@PathParam("id") UUID id) {
        SalesPlan salesPlan = salesPlanRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Sales plan not found"));
        
        salesPlanRepository.delete(salesPlan);
        return Response.noContent().build();
    }
}

