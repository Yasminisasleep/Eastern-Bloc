package com.kulto.controller;

import com.kulto.domain.*;
import com.kulto.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EventInterestControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private EventRepository eventRepository;
    @Autowired private EventInterestRepository interestRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private MatchRepository matchRepository;
    @Autowired private PreferenceRepository preferenceRepository;

    private Event event;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        matchRepository.deleteAll();
        interestRepository.deleteAll();
        preferenceRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        userRepository.save(User.builder()
                .email("ei-alice@test.com").displayName("Alice").passwordHash("h").build());
        event = eventRepository.save(Event.builder()
                .title("Test Event").description("desc").category(EventCategory.CINEMA)
                .date(LocalDateTime.now().plusDays(5)).venue("v").city("Paris")
                .source("test").build());
    }

    @Test
    void status_unauthenticated_returns401or403() throws Exception {
        mockMvc.perform(get("/api/events/" + event.getId() + "/interest"))
                .andExpect(result -> {
                    int s = result.getResponse().getStatus();
                    if (s != 401 && s != 403) {
                        throw new AssertionError("Expected 401/403 but got " + s);
                    }
                });
    }

    @Test
    @WithMockUser(username = "ei-alice@test.com")
    void status_authenticated_returnsShape() throws Exception {
        mockMvc.perform(get("/api/events/" + event.getId() + "/interest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.interested").value(false))
                .andExpect(jsonPath("$.count").value(0));
    }

    @Test
    @WithMockUser(username = "ei-alice@test.com")
    void add_thenStatus_reportsInterested() throws Exception {
        mockMvc.perform(post("/api/events/" + event.getId() + "/interest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.interested").value(true))
                .andExpect(jsonPath("$.count").value(1));

        mockMvc.perform(get("/api/events/" + event.getId() + "/interest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.interested").value(true))
                .andExpect(jsonPath("$.count").value(1));
    }

    @Test
    @WithMockUser(username = "ei-alice@test.com")
    void add_twice_isIdempotent() throws Exception {
        mockMvc.perform(post("/api/events/" + event.getId() + "/interest"))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/events/" + event.getId() + "/interest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(1));
    }

    @Test
    @WithMockUser(username = "ei-alice@test.com")
    void remove_afterAdd_clearsInterest() throws Exception {
        mockMvc.perform(post("/api/events/" + event.getId() + "/interest"))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/api/events/" + event.getId() + "/interest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.interested").value(false))
                .andExpect(jsonPath("$.count").value(0));
    }

    @Test
    @WithMockUser(username = "ei-alice@test.com")
    void add_unknownEvent_returns404() throws Exception {
        mockMvc.perform(post("/api/events/999999/interest"))
                .andExpect(status().isNotFound());
    }
}
