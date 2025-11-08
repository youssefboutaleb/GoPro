package com.medico.repositories;

import com.medico.entities.Doctor;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class DoctorRepository implements PanacheRepository<Doctor> {
    
    public Optional<Doctor> findByIdOptional(UUID id) {
        return find("id", id).firstResultOptional();
    }
    
    public List<Doctor> findByBrickId(UUID brickId) {
        return list("brickId", brickId);
    }
    
    public List<Doctor> findBySpecialty(String specialty) {
        return list("specialty", specialty);
    }
    
    public Optional<Doctor> findByFirstNameAndLastName(String firstName, String lastName) {
        return find("firstName = ?1 and lastName = ?2", firstName, lastName).firstResultOptional();
    }
    
    public List<Doctor> findAllOrdered() {
        return list("order by lastName, firstName");
    }
}