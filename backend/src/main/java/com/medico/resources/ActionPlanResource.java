package com.medico.resources;

import com.medico.dto.ActionPlanDTO;
import com.medico.entities.ActionPlan;
import com.medico.entities.ActionStatus;
import com.medico.entities.ActionType;
import com.medico.repositories.ActionPlanRepository;
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

@Path("/action-plans")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Action Plans", description = "Action plan management endpoints")
public class ActionPlanResource {
    
    @Inject
    ActionPlanRepository actionPlanRepository;
    
    @GET
    @Operation(summary = "Get all action plans", description = "Retrieve all action plans")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Action plans retrieved successfully",
        content = @Content(schema = @Schema(implementation = ActionPlanDTO.class))
    )
    public Response getAllActionPlans() {
        List<ActionPlan> actionPlans = actionPlanRepository.listAll();
        
        List<ActionPlanDTO> actionPlanDTOs = actionPlans.stream().map(this::toDTO).collect(Collectors.toList());
        
        return Response.ok(actionPlanDTOs).build();
    }
    
    @GET
    @Path("/{id}")
    @Operation(summary = "Get action plan by ID", description = "Retrieve a specific action plan by ID")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Action plan retrieved successfully",
        content = @Content(schema = @Schema(implementation = ActionPlanDTO.class))
    )
    @APIResponse(
        responseCode = "404",
        description = "Action plan not found"
    )
    public Response getActionPlanById(@PathParam("id") UUID id) {
        ActionPlan actionPlan = actionPlanRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Action plan not found"));
        
        return Response.ok(toDTO(actionPlan)).build();
    }
    
    @GET
    @Path("/created-by/{createdBy}")
    @Operation(summary = "Get action plans by creator", description = "Retrieve all action plans created by a specific user")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Action plans retrieved successfully",
        content = @Content(schema = @Schema(implementation = ActionPlanDTO.class))
    )
    public Response getActionPlansByCreatedBy(@PathParam("createdBy") UUID createdBy) {
        List<ActionPlan> actionPlans = actionPlanRepository.findByCreatedBy(createdBy);
        
        List<ActionPlanDTO> actionPlanDTOs = actionPlans.stream().map(this::toDTO).collect(Collectors.toList());
        
        return Response.ok(actionPlanDTOs).build();
    }
    
    @GET
    @Path("/type/{type}")
    @Operation(summary = "Get action plans by type", description = "Retrieve all action plans with a specific type")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Action plans retrieved successfully",
        content = @Content(schema = @Schema(implementation = ActionPlanDTO.class))
    )
    public Response getActionPlansByType(@PathParam("type") ActionType type) {
        List<ActionPlan> actionPlans = actionPlanRepository.findByType(type);
        
        List<ActionPlanDTO> actionPlanDTOs = actionPlans.stream().map(this::toDTO).collect(Collectors.toList());
        
        return Response.ok(actionPlanDTOs).build();
    }
    
    @POST
    @Transactional
    @Operation(summary = "Create action plan", description = "Create a new action plan")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "201",
        description = "Action plan created successfully",
        content = @Content(schema = @Schema(implementation = ActionPlanDTO.class))
    )
    public Response createActionPlan(@Valid @RequestBody ActionPlanDTO actionPlanDTO) {
        ActionPlan actionPlan = new ActionPlan();
        actionPlan.setLocation(actionPlanDTO.getLocation());
        actionPlan.setDate(actionPlanDTO.getDate());
        actionPlan.setDescription(actionPlanDTO.getDescription());
        actionPlan.setType(actionPlanDTO.getType());
        actionPlan.setCreatedBy(actionPlanDTO.getCreatedBy());
        actionPlan.setSupervisorStatus(actionPlanDTO.getSupervisorStatus() != null ? actionPlanDTO.getSupervisorStatus() : ActionStatus.pending);
        actionPlan.setSalesDirectorStatus(actionPlanDTO.getSalesDirectorStatus() != null ? actionPlanDTO.getSalesDirectorStatus() : ActionStatus.pending);
        actionPlan.setMarketingManagerStatus(actionPlanDTO.getMarketingManagerStatus() != null ? actionPlanDTO.getMarketingManagerStatus() : ActionStatus.pending);
        actionPlan.setIsExecuted(actionPlanDTO.getIsExecuted() != null ? actionPlanDTO.getIsExecuted() : false);
        actionPlan.setTargetedDoctors(actionPlanDTO.getTargetedDoctors());
        actionPlan.setTargetedBricks(actionPlanDTO.getTargetedBricks());
        actionPlan.setTargetedDelegates(actionPlanDTO.getTargetedDelegates());
        actionPlan.setTargetedSupervisors(actionPlanDTO.getTargetedSupervisors());
        actionPlan.setTargetedSalesDirectors(actionPlanDTO.getTargetedSalesDirectors());
        actionPlan.setTargetedProducts(actionPlanDTO.getTargetedProducts());
        
        actionPlanRepository.persist(actionPlan);
        
        actionPlanDTO.setId(actionPlan.getId());
        actionPlanDTO.setCreatedAt(actionPlan.getCreatedAt());
        actionPlanDTO.setUpdatedAt(actionPlan.getUpdatedAt());
        
        return Response.status(Response.Status.CREATED).entity(actionPlanDTO).build();
    }
    
    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Update action plan", description = "Update an existing action plan")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Action plan updated successfully",
        content = @Content(schema = @Schema(implementation = ActionPlanDTO.class))
    )
    @APIResponse(
        responseCode = "404",
        description = "Action plan not found"
    )
    public Response updateActionPlan(@PathParam("id") UUID id, @Valid @RequestBody ActionPlanDTO actionPlanDTO) {
        ActionPlan actionPlan = actionPlanRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Action plan not found"));
        
        actionPlan.setLocation(actionPlanDTO.getLocation());
        actionPlan.setDate(actionPlanDTO.getDate());
        actionPlan.setDescription(actionPlanDTO.getDescription());
        actionPlan.setType(actionPlanDTO.getType());
        actionPlan.setSupervisorStatus(actionPlanDTO.getSupervisorStatus());
        actionPlan.setSalesDirectorStatus(actionPlanDTO.getSalesDirectorStatus());
        actionPlan.setMarketingManagerStatus(actionPlanDTO.getMarketingManagerStatus());
        actionPlan.setIsExecuted(actionPlanDTO.getIsExecuted());
        actionPlan.setTargetedDoctors(actionPlanDTO.getTargetedDoctors());
        actionPlan.setTargetedBricks(actionPlanDTO.getTargetedBricks());
        actionPlan.setTargetedDelegates(actionPlanDTO.getTargetedDelegates());
        actionPlan.setTargetedSupervisors(actionPlanDTO.getTargetedSupervisors());
        actionPlan.setTargetedSalesDirectors(actionPlanDTO.getTargetedSalesDirectors());
        actionPlan.setTargetedProducts(actionPlanDTO.getTargetedProducts());
        
        actionPlanRepository.persist(actionPlan);
        
        actionPlanDTO.setId(actionPlan.getId());
        actionPlanDTO.setCreatedAt(actionPlan.getCreatedAt());
        actionPlanDTO.setUpdatedAt(actionPlan.getUpdatedAt());
        
        return Response.ok(actionPlanDTO).build();
    }
    
    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Delete action plan", description = "Delete an action plan")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "204",
        description = "Action plan deleted successfully"
    )
    @APIResponse(
        responseCode = "404",
        description = "Action plan not found"
    )
    public Response deleteActionPlan(@PathParam("id") UUID id) {
        ActionPlan actionPlan = actionPlanRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Action plan not found"));
        
        actionPlanRepository.delete(actionPlan);
        return Response.noContent().build();
    }
    
    private ActionPlanDTO toDTO(ActionPlan actionPlan) {
        ActionPlanDTO dto = new ActionPlanDTO();
        dto.setId(actionPlan.getId());
        dto.setLocation(actionPlan.getLocation());
        dto.setDate(actionPlan.getDate());
        dto.setDescription(actionPlan.getDescription());
        dto.setType(actionPlan.getType());
        dto.setCreatedBy(actionPlan.getCreatedBy());
        dto.setSupervisorStatus(actionPlan.getSupervisorStatus());
        dto.setSalesDirectorStatus(actionPlan.getSalesDirectorStatus());
        dto.setMarketingManagerStatus(actionPlan.getMarketingManagerStatus());
        dto.setIsExecuted(actionPlan.getIsExecuted());
        dto.setTargetedDoctors(actionPlan.getTargetedDoctors());
        dto.setTargetedBricks(actionPlan.getTargetedBricks());
        dto.setTargetedDelegates(actionPlan.getTargetedDelegates());
        dto.setTargetedSupervisors(actionPlan.getTargetedSupervisors());
        dto.setTargetedSalesDirectors(actionPlan.getTargetedSalesDirectors());
        dto.setTargetedProducts(actionPlan.getTargetedProducts());
        dto.setCreatedAt(actionPlan.getCreatedAt());
        dto.setUpdatedAt(actionPlan.getUpdatedAt());
        return dto;
    }
}

