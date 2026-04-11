package com.kulto.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SignupRequest {

    @Email(message = "Email should be valid")
    @NotBlank(message = "Email cannot be blank")
    private String email;

    @NotBlank(message = "Display name cannot be blank")
    @Size(min = 2, max = 50, message = "Display name must be between 2 and 50 characters")
    private String displayName;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 8, max = 120, message = "Password must be between 8 and 120 characters")
    private String password;

    public SignupRequest() {}

    public SignupRequest(String email, String displayName, String password) {
        this.email = email;
        this.displayName = displayName;
        this.password = password;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
