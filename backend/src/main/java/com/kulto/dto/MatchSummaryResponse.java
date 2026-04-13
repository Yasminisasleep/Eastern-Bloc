package com.kulto.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchSummaryResponse {
    private Long id;
    private String status;
    private double compatibilityScore;
    private String matchedUserName;
    private MatchEventResponse event;
}
