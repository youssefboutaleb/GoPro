package com.medico.repositories;

import com.medico.entities.Sales;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class SalesRepository implements PanacheRepository<Sales> {
    
    public Optional<Sales> findByIdOptional(UUID id) {
        return find("id", id).firstResultOptional();
    }
    
    public List<Sales> findBySalesPlanId(UUID salesPlanId) {
        return list("salesPlanId", salesPlanId);
    }
    
    public List<Sales> findByYear(Integer year) {
        return list("year", year);
    }
    
    public List<Sales> findAllOrdered() {
        return list("order by year desc");
    }
}

