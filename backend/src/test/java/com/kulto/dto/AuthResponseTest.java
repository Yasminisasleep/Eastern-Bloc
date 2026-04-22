package com.kulto.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AuthResponseTest {

    @Test
    void constructor_setsAllFields() {
        String token = "test-token";
        String email = "test@example.com";
        String displayName = "John Doe";

        AuthResponse response = new AuthResponse(1L, token, email, displayName);

        assertEquals(1L, response.getId());
        assertEquals(token, response.getToken());
        assertEquals(email, response.getEmail());
        assertEquals(displayName, response.getDisplayName());
        assertEquals("Bearer", response.getType());
    }

    @Test
    void noArgConstructor_createsEmptyObject() {
        AuthResponse response = new AuthResponse();

        assertNull(response.getToken());
        assertNull(response.getEmail());
        assertNull(response.getDisplayName());
        assertEquals("Bearer", response.getType());
    }

    @Test
    void setters_modifyFields() {
        AuthResponse response = new AuthResponse();

        response.setToken("new-token");
        response.setEmail("new@example.com");
        response.setDisplayName("Jane Smith");
        response.setType("CustomType");

        assertEquals("new-token", response.getToken());
        assertEquals("new@example.com", response.getEmail());
        assertEquals("Jane Smith", response.getDisplayName());
        assertEquals("CustomType", response.getType());
    }
}
