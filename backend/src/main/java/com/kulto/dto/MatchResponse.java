package com.kulto.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponse {
    private Long id;
    private String status;
    private double compatibilityScore;
    private String matchedUserName;
    private MatchEventResponse event;
    private String matchedUserBio;
    private String matchedUserCity;
    private List<String> matchedUserTags;
}
