package com.kulto.controller;

import com.kulto.dto.MatchResponse;
import com.kulto.exception.ResourceNotFoundException;
import com.kulto.repository.UserRepository;
import com.kulto.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;
    private final UserRepository userRepository;

    @GetMapping("/{matchId}")
    public ResponseEntity<MatchResponse> getMatch(
            @PathVariable Long matchId,
            Authentication authentication) {
        return ResponseEntity.ok(matchService.getMatch(matchId, resolveUserId(authentication)));
    }

    @PutMapping("/{matchId}/accept")
    public ResponseEntity<MatchResponse> acceptMatch(
            @PathVariable Long matchId,
            Authentication authentication) {
        return ResponseEntity.ok(matchService.acceptMatch(matchId, resolveUserId(authentication)));
    }

    @PutMapping("/{matchId}/reject")
    public ResponseEntity<MatchResponse> rejectMatch(
            @PathVariable Long matchId,
            Authentication authentication) {
        return ResponseEntity.ok(matchService.rejectMatch(matchId, resolveUserId(authentication)));
    }

    private Long resolveUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getId();
    }
}
