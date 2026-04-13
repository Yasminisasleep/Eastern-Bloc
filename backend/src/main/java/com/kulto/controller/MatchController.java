package com.kulto.controller;

import com.kulto.dto.MatchResponse;
import com.kulto.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @GetMapping("/{matchId}")
    public ResponseEntity<MatchResponse> getMatch(
            @PathVariable Long matchId,
            @RequestParam(defaultValue = "1") Long userId) {
        return ResponseEntity.ok(matchService.getMatch(matchId, userId));
    }

    @PutMapping("/{matchId}/accept")
    public ResponseEntity<MatchResponse> acceptMatch(
            @PathVariable Long matchId,
            @RequestParam(defaultValue = "1") Long userId) {
        return ResponseEntity.ok(matchService.acceptMatch(matchId, userId));
    }

    @PutMapping("/{matchId}/reject")
    public ResponseEntity<MatchResponse> rejectMatch(
            @PathVariable Long matchId,
            @RequestParam(defaultValue = "1") Long userId) {
        return ResponseEntity.ok(matchService.rejectMatch(matchId, userId));
    }
}
