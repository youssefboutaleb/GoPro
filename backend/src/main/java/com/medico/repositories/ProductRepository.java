package com.medico.repositories;

import com.medico.entities.Product;
import com.medico.entities.TherapeuticClass;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class ProductRepository implements PanacheRepository<Product> {
    
    public Optional<Product> findByIdOptional(UUID id) {
        return find("id", id).firstResultOptional();
    }
    
    public Optional<Product> findByName(String name) {
        return find("name", name).firstResultOptional();
    }
    
    public List<Product> findByTherapeuticClass(TherapeuticClass therapeuticClass) {
        return list("therapeuticClass", therapeuticClass);
    }
    
    public List<Product> findAllOrdered() {
        return list("order by name");
    }
}