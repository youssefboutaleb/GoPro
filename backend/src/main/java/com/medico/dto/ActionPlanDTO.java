package com.medico.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.medico.entities.ActionStatus;
import com.medico.entities.ActionType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ActionPlanDTO {
    
    @JsonProperty("id")
    private UUID id;
    
    @JsonProperty("location")
    private String location;
    
    @JsonProperty("date")
    private LocalDate date;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("type")
    private ActionType type;
    
    @JsonProperty("created_by")
    private UUID createdBy;
    
    @JsonProperty("supervisor_status")
    private ActionStatus supervisorStatus;
    
    @JsonProperty("sales_director_status")
    private ActionStatus salesDirectorStatus;
    
    @JsonProperty("marketing_manager_status")
    private ActionStatus marketingManagerStatus;
    
    @JsonProperty("is_executed")
    private Boolean isExecuted;
    
    @JsonProperty("targeted_doctors")
    private List<UUID> targetedDoctors;
    
    @JsonProperty("targeted_bricks")
    private List<UUID> targetedBricks;
    
    @JsonProperty("targeted_delegates")
    private List<UUID> targetedDelegates;
    
    @JsonProperty("targeted_supervisors")
    private List<UUID> targetedSupervisors;
    
    @JsonProperty("targeted_sales_directors")
    private List<UUID> targetedSalesDirectors;
    
    @JsonProperty("targeted_products")
    private List<UUID> targetedProducts;
    
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public ActionPlanDTO() {
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public ActionType getType() {
        return type;
    }
    
    public void setType(ActionType type) {
        this.type = type;
    }
    
    public UUID getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(UUID createdBy) {
        this.createdBy = createdBy;
    }
    
    public ActionStatus getSupervisorStatus() {
        return supervisorStatus;
    }
    
    public void setSupervisorStatus(ActionStatus supervisorStatus) {
        this.supervisorStatus = supervisorStatus;
    }
    
    public ActionStatus getSalesDirectorStatus() {
        return salesDirectorStatus;
    }
    
    public void setSalesDirectorStatus(ActionStatus salesDirectorStatus) {
        this.salesDirectorStatus = salesDirectorStatus;
    }
    
    public ActionStatus getMarketingManagerStatus() {
        return marketingManagerStatus;
    }
    
    public void setMarketingManagerStatus(ActionStatus marketingManagerStatus) {
        this.marketingManagerStatus = marketingManagerStatus;
    }
    
    public Boolean getIsExecuted() {
        return isExecuted;
    }
    
    public void setIsExecuted(Boolean isExecuted) {
        this.isExecuted = isExecuted;
    }
    
    public List<UUID> getTargetedDoctors() {
        return targetedDoctors;
    }
    
    public void setTargetedDoctors(List<UUID> targetedDoctors) {
        this.targetedDoctors = targetedDoctors;
    }
    
    public List<UUID> getTargetedBricks() {
        return targetedBricks;
    }
    
    public void setTargetedBricks(List<UUID> targetedBricks) {
        this.targetedBricks = targetedBricks;
    }
    
    public List<UUID> getTargetedDelegates() {
        return targetedDelegates;
    }
    
    public void setTargetedDelegates(List<UUID> targetedDelegates) {
        this.targetedDelegates = targetedDelegates;
    }
    
    public List<UUID> getTargetedSupervisors() {
        return targetedSupervisors;
    }
    
    public void setTargetedSupervisors(List<UUID> targetedSupervisors) {
        this.targetedSupervisors = targetedSupervisors;
    }
    
    public List<UUID> getTargetedSalesDirectors() {
        return targetedSalesDirectors;
    }
    
    public void setTargetedSalesDirectors(List<UUID> targetedSalesDirectors) {
        this.targetedSalesDirectors = targetedSalesDirectors;
    }
    
    public List<UUID> getTargetedProducts() {
        return targetedProducts;
    }
    
    public void setTargetedProducts(List<UUID> targetedProducts) {
        this.targetedProducts = targetedProducts;
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

