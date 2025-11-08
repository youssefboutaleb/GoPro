package com.medico.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.UUID;

public class BrickDTO {
    
    @JsonProperty("id")
    private UUID id;
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("sector_id")
    private UUID sectorId;
    
    // Constructors
    public BrickDTO() {
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public UUID getSectorId() {
        return sectorId;
    }
    
    public void setSectorId(UUID sectorId) {
        this.sectorId = sectorId;
    }
}