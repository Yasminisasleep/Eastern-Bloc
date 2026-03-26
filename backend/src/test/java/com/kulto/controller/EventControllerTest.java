package com.kulto.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kulto.domain.Event;
import com.kulto.domain.EventCategory;
import com.kulto.domain.EventStatus;
import com.kulto.dto.EventRequest;
import com.kulto.repository.EventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        eventRepository.deleteAll();
    }

    @Test
    @WithMockUser
    void createEvent_returnsCreated() throws Exception {
        EventRequest request = new EventRequest();
        request.setTitle("Test Concert");
        request.setDescription("A test concert");
        request.setCategory(EventCategory.CONCERT);
        request.setDate(LocalDateTime.now().plusDays(30));
        request.setVenue("Test Venue");
        request.setCity("Paris");
        request.setTags(List.of("rock"));

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Concert"))
                .andExpect(jsonPath("$.category").value("CONCERT"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @WithMockUser
    void createEvent_withPastDate_returnsBadRequest() throws Exception {
        EventRequest request = new EventRequest();
        request.setTitle("Old Event");
        request.setCategory(EventCategory.CINEMA);
        request.setDate(LocalDateTime.now().minusDays(1));
        request.setVenue("Venue");
        request.setCity("Paris");

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listEvents_returnsPage() throws Exception {
        createSampleEvent("Event 1", EventCategory.CINEMA);
        createSampleEvent("Event 2", EventCategory.CONCERT);

        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)));
    }

    @Test
    void listEvents_filterByCategory() throws Exception {
        createSampleEvent("Cinema Event", EventCategory.CINEMA);
        createSampleEvent("Concert Event", EventCategory.CONCERT);

        mockMvc.perform(get("/api/events").param("category", "CINEMA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].title").value("Cinema Event"));
    }

    @Test
    void getById_returnsEvent() throws Exception {
        Event event = createSampleEvent("Find Me", EventCategory.EXHIBITION);

        mockMvc.perform(get("/api/events/" + event.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Find Me"));
    }

    @Test
    void getById_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/events/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void updateEvent_returnsUpdated() throws Exception {
        Event event = createSampleEvent("Original", EventCategory.THEATRE);

        EventRequest update = new EventRequest();
        update.setTitle("Updated");
        update.setDescription("Updated desc");
        update.setCategory(EventCategory.THEATRE);
        update.setDate(LocalDateTime.now().plusDays(60));
        update.setVenue("New Venue");
        update.setCity("Lyon");

        mockMvc.perform(put("/api/events/" + event.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated"))
                .andExpect(jsonPath("$.city").value("Lyon"));
    }

    @Test
    @WithMockUser
    void deleteEvent_softDeletes() throws Exception {
        Event event = createSampleEvent("To Delete", EventCategory.FESTIVAL);

        mockMvc.perform(delete("/api/events/" + event.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)));
    }

    private Event createSampleEvent(String title, EventCategory category) {
        Event event = Event.builder()
                .title(title)
                .description("test")
                .category(category)
                .date(LocalDateTime.now().plusDays(30))
                .venue("Venue")
                .city("Paris")
                .tags(List.of("test"))
                .source("test")
                .build();
        return eventRepository.save(event);
    }
}
