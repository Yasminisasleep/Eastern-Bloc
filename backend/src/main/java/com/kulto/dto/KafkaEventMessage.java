package com.kulto.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class KafkaEventMessage {

    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String category;

    @NotNull
    private LocalDateTime date;

    @NotBlank
    private String venue;

    @NotBlank
    private String city;

    @NotBlank
    private String source;

    private List<String> tags;
}
