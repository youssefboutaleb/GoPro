package com.medico.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "sales")
public class Sales {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;
    
    @NotNull
    @Column(name = "year", nullable = false)
    private Integer year;
    
    @Column(name = "targets")
    private List<Integer> targets;
    
    @Column(name = "achievements")
    private List<Integer> achievements;
    
    @Column(name = "sales_plan_id")
    private UUID salesPlanId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_plan_id", insertable = false, updatable = false)
    private SalesPlan salesPlan;
    
    // Constructors
    public Sales() {
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
    
    public SalesPlan getSalesPlan() {
        return salesPlan;
    }
    
    public void setSalesPlan(SalesPlan salesPlan) {
        this.salesPlan = salesPlan;
    }
}