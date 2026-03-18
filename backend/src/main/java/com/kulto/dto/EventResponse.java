package com.kulto.dto;

import com.kulto.domain.EventCategory;
import com.kulto.domain.EventStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class EventResponse {

    private Long id;
    private String title;
    private String description;
    private EventCategory category;
    private LocalDateTime date;
    private String venue;
    private String city;
    private String imageUrl;
    private Double price;
    private String externalLink;
    private List<String> tags;
    private String source;
    private EventStatus status;
    private LocalDateTime createdAt;
}
