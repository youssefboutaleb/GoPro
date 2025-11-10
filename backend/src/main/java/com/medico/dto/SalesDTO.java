package com.medico.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.UUID;

public class SalesDTO {
    
    @JsonProperty("id")
    private UUID id;
    
    @JsonProperty("year")
    private Integer year;
    
    @JsonProperty("targets")
    private List<Integer> targets;
    
    @JsonProperty("achievements")
    private List<Integer> achievements;
    
    @JsonProperty("sales_plan_id")
    private UUID salesPlanId;
    
    // Constructors
    public SalesDTO() {
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public Integer getYear() {
        return year;
    }
    
    public void setYear(Integer year) {
        this.year = year;
    }
    
    public List<Integer> getTargets() {
        return targets;
    }
    
    public void setTargets(List<Integer> targets) {
        this.targets = targets;
    }
    
    public List<Integer> getAchievements() {
        return achievements;
    }
    
    public void setAchievements(List<Integer> achievements) {
        this.achievements = achievements;
    }
    
    public UUID getSalesPlanId() {
        return salesPlanId;
    }
    
    public void setSalesPlanId(UUID salesPlanId) {
        this.salesPlanId = salesPlanId;
    }
}

