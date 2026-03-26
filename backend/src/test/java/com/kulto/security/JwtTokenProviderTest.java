package com.kulto.security;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private static final String TEST_EMAIL = "test@example.com";

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
    }

    @Test
    void generateToken_createsValidToken() {
        String token = jwtTokenProvider.generateToken(TEST_EMAIL);

        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.contains("."));
    }

    @Test
    void getEmailFromToken_extractsCorrectEmail() {
        String token = jwtTokenProvider.generateToken(TEST_EMAIL);

        String extractedEmail = jwtTokenProvider.getEmailFromToken(token);

        assertEquals(TEST_EMAIL, extractedEmail);
    }

    @Test
    void validateToken_withValidToken_returnsTrue() {
        String token = jwtTokenProvider.generateToken(TEST_EMAIL);

        boolean isValid = jwtTokenProvider.validateToken(token);

        assertTrue(isValid);
    }

    @Test
    void validateToken_withInvalidToken_returnsFalse() {
        String invalidToken = "invalid.token.here";

        boolean isValid = jwtTokenProvider.validateToken(invalidToken);

        assertFalse(isValid);
    }

    @Test
    void validateToken_withEmptyToken_returnsFalse() {
        boolean isValid = jwtTokenProvider.validateToken("");

        assertFalse(isValid);
    }

    @Test
    void getEmailFromToken_withInvalidToken_throwsException() {
        String invalidToken = "invalid.token.here";

        assertThrows(JwtException.class, () -> jwtTokenProvider.getEmailFromToken(invalidToken));
    }

    @Test
    void generateToken_withDifferentEmails_producesUniqueTokens() {
        String token1 = jwtTokenProvider.generateToken("user1@example.com");
        String token2 = jwtTokenProvider.generateToken("user2@example.com");

        assertNotEquals(token1, token2);
    }
}
