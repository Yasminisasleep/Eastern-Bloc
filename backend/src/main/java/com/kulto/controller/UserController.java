package com.kulto.controller;

import com.kulto.dto.UserProfileRequest;
import com.kulto.dto.UserProfileResponse;
import com.kulto.service.AuthService;
import com.kulto.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMe(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(userService.getProfile(principal.getUsername()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMe(@AuthenticationPrincipal UserDetails principal,
                                                         @RequestBody UserProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(principal.getUsername(), request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getPublicProfile(@PathVariable Long id) {
        return ResponseEntity.ok(AuthService.toProfileResponse(userService.getById(id)));
    }
}
