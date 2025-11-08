package com.medico.resources;

import com.medico.dto.VisitDTO;
import com.medico.entities.Visit;
import com.medico.entities.VisitStatus;
import com.medico.repositories.VisitRepository;
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

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Path("/visits")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Visits", description = "Visit management endpoints")
public class VisitResource {
    
    @Inject
    VisitRepository visitRepository;
    
    @GET
    @Operation(summary = "Get all visits", description = "Retrieve all visits")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Visits retrieved successfully",
        content = @Content(schema = @Schema(implementation = VisitDTO.class))
    )
    public Response getAllVisits() {
        List<Visit> visits = visitRepository.listAll();
        
        List<VisitDTO> visitDTOs = visits.stream().map(visit -> {
            VisitDTO dto = new VisitDTO();
            dto.setId(visit.getId());
            dto.setVisitDate(visit.getVisitDate());
            dto.setDelegateId(visit.getDelegateId());
            dto.setDoctorId(visit.getDoctorId());
            dto.setProductId(visit.getProductId());
            dto.setBrickId(visit.getBrickId());
            dto.setStatus(visit.getStatus());
            dto.setNotes(visit.getNotes());
            dto.setFeedback(visit.getFeedback());
            dto.setReturnIndex(visit.getReturnIndex());
            dto.setCreatedAt(visit.getCreatedAt());
            dto.setUpdatedAt(visit.getUpdatedAt());
            return dto;
        }).collect(Collectors.toList());
        
        return Response.ok(visitDTOs).build();
    }
    
    @GET
    @Path("/{id}")
    @Operation(summary = "Get visit by ID", description = "Retrieve a specific visit by ID")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Visit retrieved successfully",
        content = @Content(schema = @Schema(implementation = VisitDTO.class))
    )
    @APIResponse(
        responseCode = "404",
        description = "Visit not found"
    )
    public Response getVisitById(@PathParam("id") UUID id) {
        Visit visit = visitRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Visit not found"));
        
        VisitDTO dto = new VisitDTO();
        dto.setId(visit.getId());
        dto.setVisitDate(visit.getVisitDate());
        dto.setDelegateId(visit.getDelegateId());
        dto.setDoctorId(visit.getDoctorId());
        dto.setProductId(visit.getProductId());
        dto.setBrickId(visit.getBrickId());
        dto.setStatus(visit.getStatus());
        dto.setNotes(visit.getNotes());
        dto.setFeedback(visit.getFeedback());
        dto.setReturnIndex(visit.getReturnIndex());
        dto.setCreatedAt(visit.getCreatedAt());
        dto.setUpdatedAt(visit.getUpdatedAt());
        
        return Response.ok(dto).build();
    }
    
    @GET
    @Path("/delegate/{delegateId}")
    @Operation(summary = "Get visits by delegate", description = "Retrieve all visits for a specific delegate")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Visits retrieved successfully",
        content = @Content(schema = @Schema(implementation = VisitDTO.class))
    )
    public Response getVisitsByDelegate(@PathParam("delegateId") UUID delegateId) {
        List<Visit> visits = visitRepository.findByDelegateId(delegateId);
        
        List<VisitDTO> visitDTOs = visits.stream().map(visit -> {
            VisitDTO dto = new VisitDTO();
            dto.setId(visit.getId());
            dto.setVisitDate(visit.getVisitDate());
            dto.setDelegateId(visit.getDelegateId());
            dto.setDoctorId(visit.getDoctorId());
            dto.setProductId(visit.getProductId());
            dto.setBrickId(visit.getBrickId());
            dto.setStatus(visit.getStatus());
            dto.setNotes(visit.getNotes());
            dto.setFeedback(visit.getFeedback());
            dto.setReturnIndex(visit.getReturnIndex());
            dto.setCreatedAt(visit.getCreatedAt());
            dto.setUpdatedAt(visit.getUpdatedAt());
            return dto;
        }).collect(Collectors.toList());
        
        return Response.ok(visitDTOs).build();
    }
    
    @GET
    @Path("/doctor/{doctorId}")
    @Operation(summary = "Get visits by doctor", description = "Retrieve all visits for a specific doctor")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Visits retrieved successfully",
        content = @Content(schema = @Schema(implementation = VisitDTO.class))
    )
    public Response getVisitsByDoctor(@PathParam("doctorId") UUID doctorId) {
        List<Visit> visits = visitRepository.findByDoctorId(doctorId);
        
        List<VisitDTO> visitDTOs = visits.stream().map(visit -> {
            VisitDTO dto = new VisitDTO();
            dto.setId(visit.getId());
            dto.setVisitDate(visit.getVisitDate());
            dto.setDelegateId(visit.getDelegateId());
            dto.setDoctorId(visit.getDoctorId());
            dto.setProductId(visit.getProductId());
            dto.setBrickId(visit.getBrickId());
            dto.setStatus(visit.getStatus());
            dto.setNotes(visit.getNotes());
            dto.setFeedback(visit.getFeedback());
            dto.setReturnIndex(visit.getReturnIndex());
            dto.setCreatedAt(visit.getCreatedAt());
            dto.setUpdatedAt(visit.getUpdatedAt());
            return dto;
        }).collect(Collectors.toList());
        
        return Response.ok(visitDTOs).build();
    }
    
    @GET
    @Path("/status/{status}")
    @Operation(summary = "Get visits by status", description = "Retrieve all visits with a specific status")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Visits retrieved successfully",
        content = @Content(schema = @Schema(implementation = VisitDTO.class))
    )
    public Response getVisitsByStatus(@PathParam("status") VisitStatus status) {
        List<Visit> visits = visitRepository.findByStatus(status);
        
        List<VisitDTO> visitDTOs = visits.stream().map(visit -> {
            VisitDTO dto = new VisitDTO();
            dto.setId(visit.getId());
            dto.setVisitDate(visit.getVisitDate());
            dto.setDelegateId(visit.getDelegateId());
            dto.setDoctorId(visit.getDoctorId());
            dto.setProductId(visit.getProductId());
            dto.setBrickId(visit.getBrickId());
            dto.setStatus(visit.getStatus());
            dto.setNotes(visit.getNotes());
            dto.setFeedback(visit.getFeedback());
            dto.setReturnIndex(visit.getReturnIndex());
            dto.setCreatedAt(visit.getCreatedAt());
            dto.setUpdatedAt(visit.getUpdatedAt());
            return dto;
        }).collect(Collectors.toList());
        
        return Response.ok(visitDTOs).build();
    }
    
    @POST
    @Transactional
    @Operation(summary = "Create visit", description = "Create a new visit")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "201",
        description = "Visit created successfully",
        content = @Content(schema = @Schema(implementation = VisitDTO.class))
    )
    public Response createVisit(@Valid @RequestBody VisitDTO visitDTO, @Context SecurityContext securityContext) {
        Visit visit = new Visit();
        visit.setVisitDate(visitDTO.getVisitDate());
        visit.setDelegateId(visitDTO.getDelegateId());
        visit.setDoctorId(visitDTO.getDoctorId());
        visit.setProductId(visitDTO.getProductId());
        visit.setBrickId(visitDTO.getBrickId());
        visit.setStatus(visitDTO.getStatus() != null ? visitDTO.getStatus() : VisitStatus.planned);
        visit.setNotes(visitDTO.getNotes());
        visit.setFeedback(visitDTO.getFeedback());
        visit.setReturnIndex(visitDTO.getReturnIndex());
        
        visitRepository.persist(visit);
        
        visitDTO.setId(visit.getId());
        visitDTO.setCreatedAt(visit.getCreatedAt());
        visitDTO.setUpdatedAt(visit.getUpdatedAt());
        
        return Response.status(Response.Status.CREATED).entity(visitDTO).build();
    }
    
    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Update visit", description = "Update an existing visit")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Visit updated successfully",
        content = @Content(schema = @Schema(implementation = VisitDTO.class))
    )
    @APIResponse(
        responseCode = "404",
        description = "Visit not found"
    )
    public Response updateVisit(@PathParam("id") UUID id, @Valid @RequestBody VisitDTO visitDTO) {
        Visit visit = visitRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Visit not found"));
        
        visit.setVisitDate(visitDTO.getVisitDate());
        visit.setDelegateId(visitDTO.getDelegateId());
        visit.setDoctorId(visitDTO.getDoctorId());
        visit.setProductId(visitDTO.getProductId());
        visit.setBrickId(visitDTO.getBrickId());
        visit.setStatus(visitDTO.getStatus());
        visit.setNotes(visitDTO.getNotes());
        visit.setFeedback(visitDTO.getFeedback());
        visit.setReturnIndex(visitDTO.getReturnIndex());
        
        visitRepository.persist(visit);
        
        visitDTO.setId(visit.getId());
        visitDTO.setCreatedAt(visit.getCreatedAt());
        visitDTO.setUpdatedAt(visit.getUpdatedAt());
        
        return Response.ok(visitDTO).build();
    }
    
    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Delete visit", description = "Delete a visit")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "204",
        description = "Visit deleted successfully"
    )
    @APIResponse(
        responseCode = "404",
        description = "Visit not found"
    )
    public Response deleteVisit(@PathParam("id") UUID id) {
        Visit visit = visitRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Visit not found"));
        
        visitRepository.delete(visit);
        return Response.noContent().build();
    }
}