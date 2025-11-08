package com.medico.repositories;

import com.medico.entities.Sector;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class SectorRepository implements PanacheRepository<Sector> {
    
    public Optional<Sector> findByIdOptional(UUID id) {
        return find("id", id).firstResultOptional();
    }
    
    public Optional<Sector> findByName(String name) {
        return find("name", name).firstResultOptional();
    }
    
    public List<Sector> findAllOrdered() {
        return list("order by name");
    }
}