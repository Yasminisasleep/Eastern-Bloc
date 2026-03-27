package com.kulto.controller;

import com.kulto.domain.User;
import com.kulto.dto.MatchResponse;
import com.kulto.service.MatchingService;
import com.kulto.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MatchController {

    private final MatchingService matchingService;
    private final UserService userService;

    // ── Interest ──────────────────────────────────────────────────────────

    @PostMapping("/api/events/{eventId}/interest")
    public ResponseEntity<Void> expressInterest(@PathVariable Long eventId,
                                                @AuthenticationPrincipal UserDetails principal) {
        User user = userService.getByEmail(principal.getUsername());
        matchingService.expressInterest(user, eventId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/api/events/{eventId}/interest")
    public ResponseEntity<Void> removeInterest(@PathVariable Long eventId,
                                               @AuthenticationPrincipal UserDetails principal) {
        User user = userService.getByEmail(principal.getUsername());
        matchingService.removeInterest(user, eventId);
        return ResponseEntity.noContent().build();
    }

    // ── Matches ───────────────────────────────────────────────────────────

    @GetMapping("/api/matches")
    public ResponseEntity<List<MatchResponse>> getMatches(@AuthenticationPrincipal UserDetails principal) {
        User user = userService.getByEmail(principal.getUsername());
        return ResponseEntity.ok(matchingService.getPendingMatches(user));
    }

    @PostMapping("/api/matches/{id}/accept")
    public ResponseEntity<MatchResponse> acceptMatch(@PathVariable Long id,
                                                     @AuthenticationPrincipal UserDetails principal) {
        User user = userService.getByEmail(principal.getUsername());
        return ResponseEntity.ok(matchingService.acceptMatch(user, id));
    }

    @PostMapping("/api/matches/{id}/reject")
    public ResponseEntity<MatchResponse> rejectMatch(@PathVariable Long id,
                                                     @AuthenticationPrincipal UserDetails principal) {
        User user = userService.getByEmail(principal.getUsername());
        return ResponseEntity.ok(matchingService.rejectMatch(user, id));
    }

    // ── Outings ───────────────────────────────────────────────────────────

    @GetMapping("/api/outings")
    public ResponseEntity<List<MatchResponse>> getOutings(@AuthenticationPrincipal UserDetails principal) {
        User user = userService.getByEmail(principal.getUsername());
        return ResponseEntity.ok(matchingService.getConfirmedOutings(user));
    }
}
