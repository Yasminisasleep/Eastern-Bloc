package com.kulto.controller;

import com.kulto.domain.User;
import com.kulto.dto.ContactLinkRequest;
import com.kulto.exception.ResourceNotFoundException;
import com.kulto.repository.UserRepository;
import com.kulto.security.AuthUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users/{userId}/contact")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final AuthUtils authUtils;

    @GetMapping
    public ResponseEntity<Map<String, String>> getContactLink(
            @PathVariable Long userId,
            Authentication authentication) {
        authUtils.requireOwnership(authentication, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String link = user.getContactLink() != null ? user.getContactLink() : "";
        return ResponseEntity.ok(Map.of("contactLink", link));
    }

    @PutMapping
    public ResponseEntity<Map<String, String>> updateContactLink(
            @PathVariable Long userId,
            @RequestBody ContactLinkRequest request,
            Authentication authentication) {
        authUtils.requireOwnership(authentication, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setContactLink(request.getContactLink());
        userRepository.save(user);
        String link = user.getContactLink() != null ? user.getContactLink() : "";
        return ResponseEntity.ok(Map.of("contactLink", link));
    }
}
