package com.kulto.controller;

import com.kulto.security.AuthUtils;
import com.kulto.service.EventInterestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/events/{eventId}/interest")
@RequiredArgsConstructor
public class EventInterestController {

    private final EventInterestService interestService;
    private final AuthUtils authUtils;

    @GetMapping
    public ResponseEntity<Map<String, Object>> status(
            @PathVariable Long eventId,
            Authentication authentication) {
        Long userId = authUtils.currentUserId(authentication);
        boolean interested = interestService.hasInterest(userId, eventId);
        long count = interestService.count(eventId);
        return ResponseEntity.ok(Map.of(
                "interested", interested,
                "count", count
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> add(
            @PathVariable Long eventId,
            Authentication authentication) {
        Long userId = authUtils.currentUserId(authentication);
        interestService.addInterest(userId, eventId);
        return ResponseEntity.ok(Map.of(
                "interested", true,
                "count", interestService.count(eventId)
        ));
    }

    @DeleteMapping
    public ResponseEntity<Map<String, Object>> remove(
            @PathVariable Long eventId,
            Authentication authentication) {
        Long userId = authUtils.currentUserId(authentication);
        interestService.removeInterest(userId, eventId);
        return ResponseEntity.ok(Map.of(
                "interested", false,
                "count", interestService.count(eventId)
        ));
    }
}
