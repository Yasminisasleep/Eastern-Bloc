package com.kulto.controller;

import com.kulto.dto.PreferenceRequest;
import com.kulto.dto.PreferenceResponse;
import com.kulto.security.AuthUtils;
import com.kulto.service.PreferenceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/{userId}/preferences")
@RequiredArgsConstructor
public class PreferenceController {

    private final PreferenceService preferenceService;
    private final AuthUtils authUtils;

    @GetMapping
    public ResponseEntity<PreferenceResponse> getPreferences(
            @PathVariable Long userId,
            Authentication authentication) {
        authUtils.requireOwnership(authentication, userId);
        return ResponseEntity.ok(preferenceService.getPreferences(userId));
    }

    @PutMapping
    public ResponseEntity<PreferenceResponse> savePreferences(
            @PathVariable Long userId,
            @Valid @RequestBody PreferenceRequest request,
            Authentication authentication) {
        authUtils.requireOwnership(authentication, userId);
        return ResponseEntity.ok(preferenceService.savePreferences(userId, request));
    }
}
