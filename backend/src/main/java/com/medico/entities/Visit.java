package com.medico.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "visits")
public class Visit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;
    
    @NotNull
    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;
    
    @NotNull
    @Column(name = "delegate_id", nullable = false)
    private UUID delegateId;
    
    @NotNull
    @Column(name = "doctor_id", nullable = false)
    private UUID doctorId;
    
    @Column(name = "product_id")
    private UUID productId;
    
    @Column(name = "brick_id")
    private UUID brickId;
    
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private VisitStatus status = VisitStatus.planned;
    
    @Column(name = "notes", length = 1000)
    private String notes;
    
    @Column(name = "feedback", length = 1000)
    private String feedback;
    
    @Column(name = "return_index")
    private Integer returnIndex;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delegate_id", insertable = false, updatable = false)
    private Profile delegate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", insertable = false, updatable = false)
    private Doctor doctor;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brick_id", insertable = false, updatable = false)
    private Brick brick;
    
    // Constructors
    public Visit() {
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public LocalDate getVisitDate() {
        return visitDate;
    }
    
    public void setVisitDate(LocalDate visitDate) {
        this.visitDate = visitDate;
    }
    
    public UUID getDelegateId() {
        return delegateId;
    }
    
    public void setDelegateId(UUID delegateId) {
        this.delegateId = delegateId;
    }
    
    public UUID getDoctorId() {
        return doctorId;
    }
    
    public void setDoctorId(UUID doctorId) {
        this.doctorId = doctorId;
    }
    
    public UUID getProductId() {
        return productId;
    }
    
    public void setProductId(UUID productId) {
        this.productId = productId;
    }
    
    public UUID getBrickId() {
        return brickId;
    }
    
    public void setBrickId(UUID brickId) {
        this.brickId = brickId;
    }
    
    public VisitStatus getStatus() {
        return status;
    }
    
    public void setStatus(VisitStatus status) {
        this.status = status;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public String getFeedback() {
        return feedback;
    }
    
    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
    
    public Integer getReturnIndex() {
        return returnIndex;
    }
    
    public void setReturnIndex(Integer returnIndex) {
        this.returnIndex = returnIndex;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Profile getDelegate() {
        return delegate;
    }
    
    public void setDelegate(Profile delegate) {
        this.delegate = delegate;
    }
    
    public Doctor getDoctor() {
        return doctor;
    }
    
    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }
    
    public Product getProduct() {
        return product;
    }
    
    public void setProduct(Product product) {
        this.product = product;
    }
    
    public Brick getBrick() {
        return brick;
    }
    
    public void setBrick(Brick brick) {
        this.brick = brick;
    }
}