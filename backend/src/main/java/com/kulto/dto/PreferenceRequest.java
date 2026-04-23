package com.kulto.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PreferenceRequest {

    @NotEmpty(message = "At least one category is required")
    private List<String> preferredCategories;

    @NotEmpty(message = "At least one interest tag is required")
    private List<String> interestTags;

    @Min(value = 1, message = "Radius must be at least 1 km")
    private int geographicRadiusKm;

    // Demographics: user's own profile
    @Min(value = 16, message = "Age must be at least 16")
    private Integer age;

    private String gender; // MALE | FEMALE | OTHER | PREFER_NOT_TO_SAY

    // Whom they want to meet
    private List<String> preferredGenders;

    @Min(value = 16, message = "Minimum age must be at least 16")
    private Integer preferredAgeMin;

    @Min(value = 16, message = "Maximum age must be at least 16")
    private Integer preferredAgeMax;
}
