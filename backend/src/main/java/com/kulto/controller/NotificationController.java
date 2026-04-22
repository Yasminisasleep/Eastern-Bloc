package com.kulto.controller;

import com.kulto.dto.NotificationResponse;
import com.kulto.security.AuthUtils;
import com.kulto.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthUtils authUtils;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            @PathVariable Long userId,
            Authentication authentication) {
        authUtils.requireOwnership(authentication, userId);
        return ResponseEntity.ok(notificationService.getNotifications(userId));
    }
}
