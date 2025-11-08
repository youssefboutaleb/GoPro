package com.medico.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "sales_plans")
public class SalesPlan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;
    
    @Column(name = "delegate_id")
    private UUID delegateId;
    
    @Column(name = "product_id")
    private UUID productId;
    
    @Column(name = "brick_id")
    private UUID brickId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delegate_id", insertable = false, updatable = false)
    private Profile delegate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brick_id", insertable = false, updatable = false)
    private Brick brick;
    
    @OneToMany(mappedBy = "salesPlan", fetch = FetchType.LAZY)
    private List<Sales> sales;
    
    // Constructors
    public SalesPlan() {
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public UUID getDelegateId() {
        return delegateId;
    }
    
    public void setDelegateId(UUID delegateId) {
        this.delegateId = delegateId;
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
    
    public Profile getDelegate() {
        return delegate;
    }
    
    public void setDelegate(Profile delegate) {
        this.delegate = delegate;
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
    
    public List<Sales> getSales() {
        return sales;
    }
    
    public void setSales(List<Sales> sales) {
        this.sales = sales;
    }
}