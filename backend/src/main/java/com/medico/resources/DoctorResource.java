package com.medico.resources;

import com.medico.dto.DoctorDTO;
import com.medico.entities.Doctor;
import com.medico.repositories.DoctorRepository;
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

@Path("/doctors")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Doctors", description = "Doctor management endpoints")
public class DoctorResource {
    
    @Inject
    DoctorRepository doctorRepository;
    
    @GET
    @Operation(summary = "Get all doctors", description = "Retrieve all doctors")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Doctors retrieved successfully",
        content = @Content(schema = @Schema(implementation = DoctorDTO.class))
    )
    public Response getAllDoctors() {
        List<Doctor> doctors = doctorRepository.findAllOrdered();
        
        List<DoctorDTO> doctorDTOs = doctors.stream().map(doctor -> {
            DoctorDTO dto = new DoctorDTO();
            dto.setId(doctor.getId());
            dto.setFirstName(doctor.getFirstName());
            dto.setLastName(doctor.getLastName());
            dto.setSpecialty(doctor.getSpecialty());
            dto.setBrickId(doctor.getBrickId());
            return dto;
        }).collect(Collectors.toList());
        
        return Response.ok(doctorDTOs).build();
    }
    
    @GET
    @Path("/{id}")
    @Operation(summary = "Get doctor by ID", description = "Retrieve a specific doctor by ID")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Doctor retrieved successfully",
        content = @Content(schema = @Schema(implementation = DoctorDTO.class))
    )
    @APIResponse(
        responseCode = "404",
        description = "Doctor not found"
    )
    public Response getDoctorById(@PathParam("id") UUID id) {
        Doctor doctor = doctorRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Doctor not found"));
        
        DoctorDTO dto = new DoctorDTO();
        dto.setId(doctor.getId());
        dto.setFirstName(doctor.getFirstName());
        dto.setLastName(doctor.getLastName());
        dto.setSpecialty(doctor.getSpecialty());
        dto.setBrickId(doctor.getBrickId());
        
        return Response.ok(dto).build();
    }
    
    @GET
    @Path("/brick/{brickId}")
    @Operation(summary = "Get doctors by brick", description = "Retrieve all doctors for a specific brick")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Doctors retrieved successfully",
        content = @Content(schema = @Schema(implementation = DoctorDTO.class))
    )
    public Response getDoctorsByBrick(@PathParam("brickId") UUID brickId) {
        List<Doctor> doctors = doctorRepository.findByBrickId(brickId);
        
        List<DoctorDTO> doctorDTOs = doctors.stream().map(doctor -> {
            DoctorDTO dto = new DoctorDTO();
            dto.setId(doctor.getId());
            dto.setFirstName(doctor.getFirstName());
            dto.setLastName(doctor.getLastName());
            dto.setSpecialty(doctor.getSpecialty());
            dto.setBrickId(doctor.getBrickId());
            return dto;
        }).collect(Collectors.toList());
        
        return Response.ok(doctorDTOs).build();
    }
    
    @POST
    @Transactional
    @Operation(summary = "Create doctor", description = "Create a new doctor")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "201",
        description = "Doctor created successfully",
        content = @Content(schema = @Schema(implementation = DoctorDTO.class))
    )
    public Response createDoctor(@Valid @RequestBody DoctorDTO doctorDTO) {
        Doctor doctor = new Doctor();
        doctor.setFirstName(doctorDTO.getFirstName());
        doctor.setLastName(doctorDTO.getLastName());
        doctor.setSpecialty(doctorDTO.getSpecialty());
        doctor.setBrickId(doctorDTO.getBrickId());
        
        doctorRepository.persist(doctor);
        
        doctorDTO.setId(doctor.getId());
        
        return Response.status(Response.Status.CREATED).entity(doctorDTO).build();
    }
    
    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Update doctor", description = "Update an existing doctor")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Doctor updated successfully",
        content = @Content(schema = @Schema(implementation = DoctorDTO.class))
    )
    @APIResponse(
        responseCode = "404",
        description = "Doctor not found"
    )
    public Response updateDoctor(@PathParam("id") UUID id, @Valid @RequestBody DoctorDTO doctorDTO) {
        Doctor doctor = doctorRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Doctor not found"));
        
        doctor.setFirstName(doctorDTO.getFirstName());
        doctor.setLastName(doctorDTO.getLastName());
        doctor.setSpecialty(doctorDTO.getSpecialty());
        doctor.setBrickId(doctorDTO.getBrickId());
        
        doctorRepository.persist(doctor);
        
        doctorDTO.setId(doctor.getId());
        
        return Response.ok(doctorDTO).build();
    }
    
    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Delete doctor", description = "Delete a doctor")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "204",
        description = "Doctor deleted successfully"
    )
    @APIResponse(
        responseCode = "404",
        description = "Doctor not found"
    )
    public Response deleteDoctor(@PathParam("id") UUID id) {
        Doctor doctor = doctorRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Doctor not found"));
        
        doctorRepository.delete(doctor);
        return Response.noContent().build();
    }
}

