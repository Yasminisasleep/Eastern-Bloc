package com.kulto.dto;

import com.kulto.domain.MatchStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MatchResponse {
    private Long id;
    private EventResponse event;
    private UserProfileResponse matchedUser;   // the OTHER user (not the caller)
    private double compatibilityScore;
    private MatchStatus status;
    private Boolean myAccepted;                // current user's response (null = pending)
    private Boolean theirAccepted;             // other user's response
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
