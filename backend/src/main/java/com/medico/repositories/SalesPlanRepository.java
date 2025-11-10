package com.medico.repositories;

import com.medico.entities.SalesPlan;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class SalesPlanRepository implements PanacheRepository<SalesPlan> {
    
    public Optional<SalesPlan> findByIdOptional(UUID id) {
        return find("id", id).firstResultOptional();
    }
    
    public List<SalesPlan> findByDelegateId(UUID delegateId) {
        return list("delegateId", delegateId);
    }
    
    public List<SalesPlan> findByProductId(UUID productId) {
        return list("productId", productId);
    }
    
    public List<SalesPlan> findByBrickId(UUID brickId) {
        return list("brickId", brickId);
    }
    
    public List<SalesPlan> findAllOrdered() {
        return list("order by id");
    }
}

