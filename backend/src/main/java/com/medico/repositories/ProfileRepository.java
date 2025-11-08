package com.medico.repositories;

import com.medico.entities.Profile;
import com.medico.entities.RoleType;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class ProfileRepository implements PanacheRepository<Profile> {
    
    public Optional<Profile> findByIdOptional(UUID id) {
        return find("id", id).firstResultOptional();
    }
    
    public List<Profile> findByRole(RoleType role) {
        return list("role", role);
    }
    
    public List<Profile> findBySupervisorId(UUID supervisorId) {
        return list("supervisorId", supervisorId);
    }
    
    public List<Profile> findBySectorId(UUID sectorId) {
        return list("sectorId", sectorId);
    }
    
    public Optional<Profile> findByFirstNameAndLastName(String firstName, String lastName) {
        return find("firstName = ?1 and lastName = ?2", firstName, lastName).firstResultOptional();
    }
}