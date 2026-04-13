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
}
