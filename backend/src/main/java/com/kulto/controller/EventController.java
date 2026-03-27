package com.kulto.controller;

import com.kulto.domain.EventCategory;
import com.kulto.domain.User;
import com.kulto.dto.EventRequest;
import com.kulto.dto.EventResponse;
import com.kulto.service.EventService;
import com.kulto.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<EventResponse> create(@Valid @RequestBody EventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.create(request));
    }

    @GetMapping
    public Page<EventResponse> list(
            @RequestParam(required = false) EventCategory category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) LocalDateTime from,
            @RequestParam(required = false) LocalDateTime to,
            @RequestParam(required = false) String q,
            @AuthenticationPrincipal UserDetails principal,
            @PageableDefault(sort = "date", direction = Sort.Direction.ASC) Pageable pageable) {
        User currentUser = principal != null ? userService.getByEmail(principal.getUsername()) : null;
        return eventService.list(category, city, from, to, q, currentUser, pageable);
    }

    @GetMapping("/{id}")
    public EventResponse getById(@PathVariable Long id,
                                  @AuthenticationPrincipal UserDetails principal) {
        User currentUser = principal != null ? userService.getByEmail(principal.getUsername()) : null;
        return eventService.getById(id, currentUser);
    }

    @PutMapping("/{id}")
    public EventResponse update(@PathVariable Long id, @Valid @RequestBody EventRequest request) {
        return eventService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        eventService.delete(id);
    }
}
