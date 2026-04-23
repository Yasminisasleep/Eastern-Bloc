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
public class PreferenceResponse {
    private List<String> preferredCategories;
    private List<String> interestTags;
    private int geographicRadiusKm;
    private Integer age;
    private String gender;
    private List<String> preferredGenders;
    private Integer preferredAgeMin;
    private Integer preferredAgeMax;
    private String updatedAt;
}
