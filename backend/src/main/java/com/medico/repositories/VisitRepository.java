package com.medico.repositories;

import com.medico.entities.Visit;
import com.medico.entities.VisitStatus;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class VisitRepository implements PanacheRepository<Visit> {
    
    public Optional<Visit> findByIdOptional(UUID id) {
        return find("id", id).firstResultOptional();
    }
    
    public List<Visit> findByDelegateId(UUID delegateId) {
        return list("delegateId", delegateId);
    }
    
    public List<Visit> findByDoctorId(UUID doctorId) {
        return list("doctorId", doctorId);
    }
    
    public List<Visit> findByBrickId(UUID brickId) {
        return list("brickId", brickId);
    }
    
    public List<Visit> findByProductId(UUID productId) {
        return list("productId", productId);
    }
    
    public List<Visit> findByStatus(VisitStatus status) {
        return list("status", status);
    }
    
    public List<Visit> findByVisitDateBetween(LocalDate startDate, LocalDate endDate) {
        return list("visitDate between ?1 and ?2", startDate, endDate);
    }
    
    public List<Visit> findByDelegateIdAndVisitDateBetween(UUID delegateId, LocalDate startDate, LocalDate endDate) {
        return list("delegateId = ?1 and visitDate between ?2 and ?3", delegateId, startDate, endDate);
    }
}