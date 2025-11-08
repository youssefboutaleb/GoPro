package com.medico.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "sectors")
public class Sector {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;
    
    @NotNull
    @Size(max = 255)
    @Column(name = "name", nullable = false)
    private String name;
    
    @OneToMany(mappedBy = "sector", fetch = FetchType.LAZY)
    private List<Brick> bricks;
    
    @OneToMany(mappedBy = "sector", fetch = FetchType.LAZY)
    private List<Profile> profiles;
    
    // Constructors
    public Sector() {
    }
    
    public Sector(String name) {
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
    
    public List<Brick> getBricks() {
        return bricks;
    }
    
    public void setBricks(List<Brick> bricks) {
        this.bricks = bricks;
    }
    
    public List<Profile> getProfiles() {
        return profiles;
    }
    
    public void setProfiles(List<Profile> profiles) {
        this.profiles = profiles;
    }
}