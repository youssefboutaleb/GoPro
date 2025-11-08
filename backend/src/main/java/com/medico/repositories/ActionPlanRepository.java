package com.medico.repositories;

import com.medico.entities.ActionPlan;
import com.medico.entities.ActionStatus;
import com.medico.entities.ActionType;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class ActionPlanRepository implements PanacheRepository<ActionPlan> {
    
    public Optional<ActionPlan> findByIdOptional(UUID id) {
        return find("id", id).firstResultOptional();
    }
    
    public List<ActionPlan> findByCreatedBy(UUID createdBy) {
        return list("createdBy", createdBy);
    }
    
    public List<ActionPlan> findByType(ActionType type) {
        return list("type", type);
    }
    
    public List<ActionPlan> findByDateBetween(LocalDate startDate, LocalDate endDate) {
        return list("date between ?1 and ?2", startDate, endDate);
    }
    
    public List<ActionPlan> findBySupervisorStatus(ActionStatus status) {
        return list("supervisorStatus", status);
    }
    
    public List<ActionPlan> findBySalesDirectorStatus(ActionStatus status) {
        return list("salesDirectorStatus", status);
    }
    
    public List<ActionPlan> findByMarketingManagerStatus(ActionStatus status) {
        return list("marketingManagerStatus", status);
    }
    
    public List<ActionPlan> findByIsExecuted(Boolean isExecuted) {
        return list("isExecuted", isExecuted);
    }
}