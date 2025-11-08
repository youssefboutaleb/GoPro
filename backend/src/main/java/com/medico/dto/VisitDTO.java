package com.medico.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.medico.entities.VisitStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class VisitDTO {
    
    @JsonProperty("id")
    private UUID id;
    
    @JsonProperty("visit_date")
    private LocalDate visitDate;
    
    @JsonProperty("delegate_id")
    private UUID delegateId;
    
    @JsonProperty("doctor_id")
    private UUID doctorId;
    
    @JsonProperty("product_id")
    private UUID productId;
    
    @JsonProperty("brick_id")
    private UUID brickId;
    
    @JsonProperty("status")
    private VisitStatus status;
    
    @JsonProperty("notes")
    private String notes;
    
    @JsonProperty("feedback")
    private String feedback;
    
    @JsonProperty("return_index")
    private Integer returnIndex;
    
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
    
    @JsonProperty("delegate")
    private ProfileDTO delegate;
    
    @JsonProperty("doctor")
    private DoctorDTO doctor;
    
    @JsonProperty("product")
    private ProductDTO product;
    
    @JsonProperty("brick")
    private BrickDTO brick;
    
    // Constructors
    public VisitDTO() {
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
    
    public ProfileDTO getDelegate() {
        return delegate;
    }
    
    public void setDelegate(ProfileDTO delegate) {
        this.delegate = delegate;
    }
    
    public DoctorDTO getDoctor() {
        return doctor;
    }
    
    public void setDoctor(DoctorDTO doctor) {
        this.doctor = doctor;
    }
    
    public ProductDTO getProduct() {
        return product;
    }
    
    public void setProduct(ProductDTO product) {
        this.product = product;
    }
    
    public BrickDTO getBrick() {
        return brick;
    }
    
    public void setBrick(BrickDTO brick) {
        this.brick = brick;
    }
}