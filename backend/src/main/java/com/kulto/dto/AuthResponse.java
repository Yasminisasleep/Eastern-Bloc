package com.kulto.dto;

public class AuthResponse {
    private Long id;
    private String token;
    private String type = "Bearer";
    private String email;
    private String displayName;

    public AuthResponse() {
    }

    public AuthResponse(Long id, String token, String email, String displayName) {
        this.id = id;
        this.token = token;
        this.email = email;
        this.displayName = displayName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
}
