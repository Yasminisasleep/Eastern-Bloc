package com.kulto.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchEventResponse {
    private Long id;
    private String title;
    private String category;
    private String date;
    private String city;
    private String venue;
}
