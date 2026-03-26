package com.kulto.service;

import com.kulto.domain.User;
import com.kulto.dto.AuthResponse;
import com.kulto.dto.LoginRequest;
import com.kulto.dto.SignupRequest;
import com.kulto.exception.AuthenticationException;
import com.kulto.repository.UserRepository;
import com.kulto.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class AuthServiceTest {

    @Autowired
    private UserRepository userRepository;

    private AuthService authService;
    private BCryptPasswordEncoder passwordEncoder;
    private JwtTokenProvider jwtTokenProvider;

    private static final String TEST_SECRET = "ThisIsAVeryLongSecretKeyForJWTSigningPurposesOnlyDoNotUseInProduction";
    private static final long TEST_EXPIRATION = 86400000L;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        jwtTokenProvider = new JwtTokenProvider(TEST_SECRET, TEST_EXPIRATION);
        authService = new AuthService(userRepository, jwtTokenProvider, passwordEncoder);
        userRepository.deleteAll();
    }

    @Test
    void signup_createsNewUser() {
        SignupRequest request = new SignupRequest();
        request.setEmail("test@example.com");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPassword("password123");

        AuthResponse response = authService.signup(request);

        assertNotNull(response);
        assertEquals("test@example.com", response.getEmail());
        assertEquals("John", response.getFirstName());
        assertEquals("Doe", response.getLastName());
        assertNotNull(response.getToken());
        assertEquals("Bearer", response.getType());
        assertTrue(userRepository.existsByEmail("test@example.com"));
    }

    @Test
    void signup_withDuplicateEmail_throwsException() {
        SignupRequest request = new SignupRequest();
        request.setEmail("duplicate@example.com");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPassword("password123");

        authService.signup(request);

        SignupRequest duplicateRequest = new SignupRequest();
        duplicateRequest.setEmail("duplicate@example.com");
        duplicateRequest.setFirstName("Jane");
        duplicateRequest.setLastName("Smith");
        duplicateRequest.setPassword("password456");

        assertThrows(AuthenticationException.class, () -> authService.signup(duplicateRequest));
    }

    @Test
    void login_withValidCredentials_returnsToken() {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("login@example.com");
        signupRequest.setFirstName("John");
        signupRequest.setLastName("Doe");
        signupRequest.setPassword("password123");

        authService.signup(signupRequest);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("login@example.com");
        loginRequest.setPassword("password123");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("login@example.com", response.getEmail());
        assertNotNull(response.getToken());
    }

    @Test
    void login_withInvalidEmail_throwsException() {
        LoginRequest request = new LoginRequest();
        request.setEmail("nonexistent@example.com");
        request.setPassword("password123");

        assertThrows(AuthenticationException.class, () -> authService.login(request));
    }

    @Test
    void login_withWrongPassword_throwsException() {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("wrongpass@example.com");
        signupRequest.setFirstName("John");
        signupRequest.setLastName("Doe");
        signupRequest.setPassword("password123");

        authService.signup(signupRequest);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("wrongpass@example.com");
        loginRequest.setPassword("wrongpassword");

        assertThrows(AuthenticationException.class, () -> authService.login(loginRequest));
    }

    @Test
    void findByEmail_existingUser_returnsUser() {
        SignupRequest request = new SignupRequest();
        request.setEmail("find@example.com");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPassword("password123");

        authService.signup(request);

        User user = authService.findByEmail("find@example.com");

        assertNotNull(user);
        assertEquals("find@example.com", user.getEmail());
        assertEquals("John", user.getFirstName());
    }

    @Test
    void findByEmail_nonExistentUser_throwsException() {
        assertThrows(AuthenticationException.class, () -> authService.findByEmail("notfound@example.com"));
    }
}
