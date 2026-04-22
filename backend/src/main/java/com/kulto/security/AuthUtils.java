package com.kulto.security;

import com.kulto.exception.AuthenticationException;
import com.kulto.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthUtils {

    private final UserRepository userRepository;

    public Long currentUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AuthenticationException("Not authenticated");
        }
        return userRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new AuthenticationException("User not found"))
                .getId();
    }

    public void requireOwnership(Authentication authentication, Long targetUserId) {
        Long currentId = currentUserId(authentication);
        if (!currentId.equals(targetUserId)) {
            throw new AccessDeniedException("Forbidden: resource belongs to another user");
        }
    }
}
