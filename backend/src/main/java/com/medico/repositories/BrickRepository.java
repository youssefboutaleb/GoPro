package com.medico.repositories;

import com.medico.entities.Brick;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class BrickRepository implements PanacheRepository<Brick> {
    
    public Optional<Brick> findByIdOptional(UUID id) {
        return find("id", id).firstResultOptional();
    }
    
    public Optional<Brick> findByName(String name) {
        return find("name", name).firstResultOptional();
    }
    
    public List<Brick> findBySectorId(UUID sectorId) {
        return list("sectorId", sectorId);
    }
    
    public List<Brick> findAllOrdered() {
        return list("order by name");
    }
}