package com.medico.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "doctors")
public class Doctor {
    
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
    
    @Size(max = 255)
    @Column(name = "specialty")
    private String specialty;
    
    @Column(name = "brick_id")
    private UUID brickId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brick_id", insertable = false, updatable = false)
    private Brick brick;
    
    @OneToMany(mappedBy = "doctor", fetch = FetchType.LAZY)
    private List<Visit> visits;
    
    // Constructors
    public Doctor() {
    }
    
    public Doctor(String firstName, String lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
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
    
    public String getSpecialty() {
        return specialty;
    }
    
    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }
    
    public UUID getBrickId() {
        return brickId;
    }
    
    public void setBrickId(UUID brickId) {
        this.brickId = brickId;
    }
    
    public Brick getBrick() {
        return brick;
    }
    
    public void setBrick(Brick brick) {
        this.brick = brick;
    }
    
    public List<Visit> getVisits() {
        return visits;
    }
    
    public void setVisits(List<Visit> visits) {
        this.visits = visits;
    }
}