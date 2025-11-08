package com.medico.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "products")
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;
    
    @NotNull
    @Size(max = 255)
    @Column(name = "name", nullable = false)
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "therapeutic_class")
    private TherapeuticClass therapeuticClass;
    
    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    private List<SalesPlan> salesPlans;
    
    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    private List<Visit> visits;
    
    // Constructors
    public Product() {
    }
    
    public Product(String name) {
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
    
    public TherapeuticClass getTherapeuticClass() {
        return therapeuticClass;
    }
    
    public void setTherapeuticClass(TherapeuticClass therapeuticClass) {
        this.therapeuticClass = therapeuticClass;
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