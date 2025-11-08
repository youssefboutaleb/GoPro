package com.medico.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class AuthRequestDTO {
    
    @JsonProperty("email")
    @NotBlank(message = "Email is required")
    private String email;
    
    @JsonProperty("password")
    @NotBlank(message = "Password is required")
    private String password;
    
    // Constructors
    public AuthRequestDTO() {
    }
    
    public AuthRequestDTO(String email, String password) {
        this.email = email;
        this.password = password;
    }
    
    // Getters and Setters
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
}