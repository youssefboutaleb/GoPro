package com.medico.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "bricks")
public class Brick {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;
    
    @NotNull
    @Size(max = 255)
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "sector_id")
    private UUID sectorId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sector_id", insertable = false, updatable = false)
    private Sector sector;
    
    @OneToMany(mappedBy = "brick", fetch = FetchType.LAZY)
    private List<Doctor> doctors;
    
    @OneToMany(mappedBy = "brick", fetch = FetchType.LAZY)
    private List<SalesPlan> salesPlans;
    
    @OneToMany(mappedBy = "brick", fetch = FetchType.LAZY)
    private List<Visit> visits;
    
    // Constructors
    public Brick() {
    }
    
    public Brick(String name) {
        this.name = name;
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
    
    public Sector getSector() {
        return sector;
    }
    
    public void setSector(Sector sector) {
        this.sector = sector;
    }
    
    public List<Doctor> getDoctors() {
        return doctors;
    }
    
    public void setDoctors(List<Doctor> doctors) {
        this.doctors = doctors;
    }
    
    public List<SalesPlan> getSalesPlans() {
        return salesPlans;
    }
    
    public void setSalesPlans(List<SalesPlan> salesPlans) {
        this.salesPlans = salesPlans;
    }
    
    public List<Visit> getVisits() {
        return visits;
    }
    
    public void setVisits(List<Visit> visits) {
        this.visits = visits;
    }
}