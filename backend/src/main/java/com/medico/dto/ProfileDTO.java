package com.medico.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.medico.entities.RoleType;

import java.time.LocalDateTime;
import java.util.UUID;

public class ProfileDTO {
    
    @JsonProperty("id")
    private UUID id;
    
    @JsonProperty("first_name")
    private String firstName;
    
    @JsonProperty("last_name")
    private String lastName;
    
    @JsonProperty("role")
    private RoleType role;
    
    @JsonProperty("sector_id")
    private UUID sectorId;
    
    @JsonProperty("supervisor_id")
    private UUID supervisorId;
    
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public ProfileDTO() {
    }
    
    public ProfileDTO(UUID id, String firstName, String lastName, RoleType role) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public RoleType getRole() {
        return role;
    }
    
    public void setRole(RoleType role) {
        this.role = role;
    }
    
    public UUID getSectorId() {
        return sectorId;
    }
    
    public void setSectorId(UUID sectorId) {
        this.sectorId = sectorId;
    }
    
    public UUID getSupervisorId() {
        return supervisorId;
    }
    
    public void setSupervisorId(UUID supervisorId) {
        this.supervisorId = supervisorId;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}