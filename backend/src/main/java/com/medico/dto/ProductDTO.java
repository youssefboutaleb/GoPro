package com.medico.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.medico.entities.TherapeuticClass;

import java.util.UUID;

public class ProductDTO {
    
    @JsonProperty("id")
    private UUID id;
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("therapeutic_class")
    private TherapeuticClass therapeuticClass;
    
    // Constructors
    public ProductDTO() {
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
    
    public TherapeuticClass getTherapeuticClass() {
        return therapeuticClass;
    }
    
    public void setTherapeuticClass(TherapeuticClass therapeuticClass) {
        this.therapeuticClass = therapeuticClass;
    }
}