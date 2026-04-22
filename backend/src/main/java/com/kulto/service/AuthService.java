package com.kulto.service;

import com.kulto.domain.User;
import com.kulto.dto.AuthResponse;
import com.kulto.dto.LoginRequest;
import com.kulto.dto.SignupRequest;
import com.kulto.exception.AuthenticationException;
import com.kulto.repository.UserRepository;
import com.kulto.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final BCryptPasswordEncoder passwordEncoder;

    /**
     * Registers a new user with email, name, and password.
     * Password is hashed using BCrypt before storage.
     */
    public AuthResponse signup(SignupRequest request) {
        String email = normalize(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            throw new AuthenticationException("Email already registered");
        }

        User user = User.builder()
                .email(email)
                .displayName(request.getDisplayName())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);
        String token = jwtTokenProvider.generateToken(user.getEmail());

        return new AuthResponse(user.getId(), token, user.getEmail(), user.getDisplayName());
    }

    /**
     * Authenticates a user with email and password.
     * Returns a JWT token if credentials are valid.
     */
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(normalize(request.getEmail()))
                .orElseThrow(() -> new AuthenticationException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AuthenticationException("Invalid email or password");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail());
        return new AuthResponse(user.getId(), token, user.getEmail(), user.getDisplayName());
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(normalize(email))
                .orElseThrow(() -> new AuthenticationException("User not found"));
    }

    private String normalize(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
