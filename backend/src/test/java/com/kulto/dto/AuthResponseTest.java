package com.kulto.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AuthResponseTest {

    @Test
    void constructor_setsAllFields() {
        String token = "test-token";
        String email = "test@example.com";
        String firstName = "John";
        String lastName = "Doe";

        AuthResponse response = new AuthResponse(token, email, firstName, lastName);

        assertEquals(token, response.getToken());
        assertEquals(email, response.getEmail());
        assertEquals(firstName, response.getFirstName());
        assertEquals(lastName, response.getLastName());
        assertEquals("Bearer", response.getType());
    }

    @Test
    void noArgConstructor_createsEmptyObject() {
        AuthResponse response = new AuthResponse();

        assertNull(response.getToken());
        assertNull(response.getEmail());
        assertNull(response.getFirstName());
        assertNull(response.getLastName());
        assertEquals("Bearer", response.getType());
    }

    @Test
    void setters_modifyFields() {
        AuthResponse response = new AuthResponse();

        response.setToken("new-token");
        response.setEmail("new@example.com");
        response.setFirstName("Jane");
        response.setLastName("Smith");
        response.setType("CustomType");

        assertEquals("new-token", response.getToken());
        assertEquals("new@example.com", response.getEmail());
        assertEquals("Jane", response.getFirstName());
        assertEquals("Smith", response.getLastName());
        assertEquals("CustomType", response.getType());
    }
}
