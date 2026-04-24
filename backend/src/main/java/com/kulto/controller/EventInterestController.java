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

    private static final String KEY_INTERESTED = "interested";
    private static final String KEY_COUNT = "count";

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
                KEY_INTERESTED, interested,
                KEY_COUNT, count
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> add(
            @PathVariable Long eventId,
            Authentication authentication) {
        Long userId = authUtils.currentUserId(authentication);
        interestService.addInterest(userId, eventId);
        return ResponseEntity.ok(Map.of(
                KEY_INTERESTED, true,
                KEY_COUNT, interestService.count(eventId)
        ));
    }

    @DeleteMapping
    public ResponseEntity<Map<String, Object>> remove(
            @PathVariable Long eventId,
            Authentication authentication) {
        Long userId = authUtils.currentUserId(authentication);
        interestService.removeInterest(userId, eventId);
        return ResponseEntity.ok(Map.of(
                KEY_INTERESTED, false,
                KEY_COUNT, interestService.count(eventId)
        ));
    }
}
