package com.medico.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "profiles")
public class Profile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;
    
    @NotNull
    @Size(max = 255)
    @Column(name = "first_name", nullable = false)
    private String firstName;
    
    @NotNull
    @Size(max = 255)
    @Column(name = "last_name", nullable = false)
    private String lastName;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private RoleType role;
    
    @Column(name = "sector_id")
    private UUID sectorId;
    
    @Column(name = "supervisor_id")
    private UUID supervisorId;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sector_id", insertable = false, updatable = false)
    private Sector sector;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id", insertable = false, updatable = false)
    private Profile supervisor;
    
    @OneToMany(mappedBy = "supervisor", fetch = FetchType.LAZY)
    private List<Profile> subordinates;
    
    @OneToMany(mappedBy = "delegate", fetch = FetchType.LAZY)
    private List<SalesPlan> salesPlans;
    
    @OneToMany(mappedBy = "createdBy", fetch = FetchType.LAZY)
    private List<ActionPlan> createdActionPlans;
    
    @OneToMany(mappedBy = "delegate", fetch = FetchType.LAZY)
    private List<Visit> visits;
    
    // Constructors
    public Profile() {
    }
    
    public Profile(String firstName, String lastName, RoleType role) {
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
    
    public Sector getSector() {
        return sector;
    }
    
    public void setSector(Sector sector) {
        this.sector = sector;
    }
    
    public Profile getSupervisor() {
        return supervisor;
    }
    
    public void setSupervisor(Profile supervisor) {
        this.supervisor = supervisor;
    }
    
    public List<Profile> getSubordinates() {
        return subordinates;
    }
    
    public void setSubordinates(List<Profile> subordinates) {
        this.subordinates = subordinates;
    }
    
    public List<SalesPlan> getSalesPlans() {
        return salesPlans;
    }
    
    public void setSalesPlans(List<SalesPlan> salesPlans) {
        this.salesPlans = salesPlans;
    }
    
    public List<ActionPlan> getCreatedActionPlans() {
        return createdActionPlans;
    }
    
    public void setCreatedActionPlans(List<ActionPlan> createdActionPlans) {
        this.createdActionPlans = createdActionPlans;
    }
    
    public List<Visit> getVisits() {
        return visits;
    }
    
    public void setVisits(List<Visit> visits) {
        this.visits = visits;
    }
}