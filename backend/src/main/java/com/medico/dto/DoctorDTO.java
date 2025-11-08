package com.medico.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.UUID;

public class DoctorDTO {
    
    @JsonProperty("id")
    private UUID id;
    
    @JsonProperty("first_name")
    private String firstName;
    
    @JsonProperty("last_name")
    private String lastName;
    
    @JsonProperty("specialty")
    private String specialty;
    
    @JsonProperty("brick_id")
    private UUID brickId;
    
    // Constructors
    public DoctorDTO() {
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
    
    public String getSpecialty() {
        return specialty;
    }
    
    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }
    
    public UUID getBrickId() {
        return brickId;
    }
    
    public void setBrickId(UUID brickId) {
        this.brickId = brickId;
    }
}