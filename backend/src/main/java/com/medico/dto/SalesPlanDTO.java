package com.medico.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.UUID;

public class SalesPlanDTO {
    
    @JsonProperty("id")
    private UUID id;
    
    @JsonProperty("delegate_id")
    private UUID delegateId;
    
    @JsonProperty("product_id")
    private UUID productId;
    
    @JsonProperty("brick_id")
    private UUID brickId;
    
    // Constructors
    public SalesPlanDTO() {
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public UUID getDelegateId() {
        return delegateId;
    }
    
    public void setDelegateId(UUID delegateId) {
        this.delegateId = delegateId;
    }
    
    public UUID getProductId() {
        return productId;
    }
    
    public void setProductId(UUID productId) {
        this.productId = productId;
    }
    
    public UUID getBrickId() {
        return brickId;
    }
    
    public void setBrickId(UUID brickId) {
        this.brickId = brickId;
    }
}

