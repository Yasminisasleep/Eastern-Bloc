package com.kulto.service;

import com.kulto.domain.Event;
import com.kulto.domain.EventCategory;
import com.kulto.domain.EventStatus;
import com.kulto.dto.EventRequest;
import com.kulto.dto.EventResponse;
import com.kulto.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    public EventResponse create(EventRequest request) {
        Event event = Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .date(request.getDate())
                .venue(request.getVenue())
                .city(request.getCity())
                .imageUrl(request.getImageUrl())
                .price(request.getPrice())
                .externalLink(request.getExternalLink())
                .tags(request.getTags())
                .source("manual")
                .build();
        return toResponse(eventRepository.save(event));
    }

    public Page<EventResponse> list(EventCategory category, String city,
                                     LocalDateTime from, LocalDateTime to,
                                     String q, Pageable pageable) {
        return eventRepository.findFiltered(
                EventStatus.ACTIVE, LocalDateTime.now(),
                category, city, from, to, q, pageable
        ).map(this::toResponse);
    }

    public EventResponse getById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + id));
        return toResponse(event);
    }

    public EventResponse update(Long id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + id));
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setCategory(request.getCategory());
        event.setDate(request.getDate());
        event.setVenue(request.getVenue());
        event.setCity(request.getCity());
        event.setImageUrl(request.getImageUrl());
        event.setPrice(request.getPrice());
        event.setExternalLink(request.getExternalLink());
        event.setTags(request.getTags());
        return toResponse(eventRepository.save(event));
    }

    public void delete(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + id));
        event.setStatus(EventStatus.CANCELLED);
        eventRepository.save(event);
    }

    private EventResponse toResponse(Event event) {
        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .category(event.getCategory())
                .date(event.getDate())
                .venue(event.getVenue())
                .city(event.getCity())
                .imageUrl(event.getImageUrl())
                .price(event.getPrice())
                .externalLink(event.getExternalLink())
                .tags(event.getTags())
                .source(event.getSource())
                .status(event.getStatus())
                .createdAt(event.getCreatedAt())
                .build();
    }
}
