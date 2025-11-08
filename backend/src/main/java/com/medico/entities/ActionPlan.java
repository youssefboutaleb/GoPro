package com.medico.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "action_plans")
public class ActionPlan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;
    
    @NotNull
    @Size(max = 255)
    @Column(name = "location", nullable = false)
    private String location;
    
    @NotNull
    @Column(name = "date", nullable = false)
    private LocalDate date;
    
    @Size(max = 1000)
    @Column(name = "description")
    private String description;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ActionType type;
    
    @NotNull
    @Column(name = "created_by", nullable = false)
    private UUID createdBy;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "supervisor_status", nullable = false)
    private ActionStatus supervisorStatus = ActionStatus.pending;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "sales_director_status", nullable = false)
    private ActionStatus salesDirectorStatus = ActionStatus.pending;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "marketing_manager_status", nullable = false)
    private ActionStatus marketingManagerStatus = ActionStatus.pending;
    
    @Column(name = "is_executed")
    private Boolean isExecuted = false;
    
    @ElementCollection
    @CollectionTable(name = "action_plan_targeted_doctors", joinColumns = @JoinColumn(name = "action_plan_id"))
    @Column(name = "doctor_id")
    private List<UUID> targetedDoctors;
    
    @ElementCollection
    @CollectionTable(name = "action_plan_targeted_bricks", joinColumns = @JoinColumn(name = "action_plan_id"))
    @Column(name = "brick_id")
    private List<UUID> targetedBricks;
    
    @ElementCollection
    @CollectionTable(name = "action_plan_targeted_delegates", joinColumns = @JoinColumn(name = "action_plan_id"))
    @Column(name = "delegate_id")
    private List<UUID> targetedDelegates;
    
    @ElementCollection
    @CollectionTable(name = "action_plan_targeted_supervisors", joinColumns = @JoinColumn(name = "action_plan_id"))
    @Column(name = "supervisor_id")
    private List<UUID> targetedSupervisors;
    
    @ElementCollection
    @CollectionTable(name = "action_plan_targeted_sales_directors", joinColumns = @JoinColumn(name = "action_plan_id"))
    @Column(name = "sales_director_id")
    private List<UUID> targetedSalesDirectors;
    
    @ElementCollection
    @CollectionTable(name = "action_plan_targeted_products", joinColumns = @JoinColumn(name = "action_plan_id"))
    @Column(name = "product_id")
    private List<UUID> targetedProducts;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", insertable = false, updatable = false)
    private Profile createdByProfile;
    
    // Constructors
    public ActionPlan() {
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
    
    public Profile getCreatedByProfile() {
        return createdByProfile;
    }
    
    public void setCreatedByProfile(Profile createdByProfile) {
        this.createdByProfile = createdByProfile;
    }
}