package com.kulto.dto;

import com.kulto.domain.EventCategory;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class EventRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private EventCategory category;

    @NotNull
    @Future
    private LocalDateTime date;

    @NotBlank
    private String venue;

    @NotBlank
    private String city;

    private String imageUrl;

    private Double price;

    private String externalLink;

    private List<String> tags;
}
