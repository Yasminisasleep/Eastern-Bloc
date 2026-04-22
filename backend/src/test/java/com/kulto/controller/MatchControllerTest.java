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
class MatchControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private MatchRepository matchRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private EventRepository eventRepository;
    @Autowired private PreferenceRepository preferenceRepository;

    private User user1;
    private User user2;
    private Match match;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        matchRepository.deleteAll();
        preferenceRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        user1 = userRepository.save(User.builder()
                .email("m1@test.com").displayName("Alice").passwordHash("h").build());
        user2 = userRepository.save(User.builder()
                .email("m2@test.com").displayName("Bob").passwordHash("h").build());

        Event event = eventRepository.save(Event.builder()
                .title("Dune").description("Film").category(EventCategory.CINEMA)
                .date(LocalDateTime.now().plusDays(10)).venue("MK2").city("Paris")
                .source("test").build());

        match = matchRepository.save(Match.builder()
                .userOne(user1).userTwo(user2).event(event)
                .compatibilityScore(0.75).status(MatchStatus.PENDING)
                .createdAt(LocalDateTime.now()).build());
    }

    @Test
    @WithMockUser(username = "m1@test.com")
    void getMatch_returnsMatchDetail() throws Exception {
        mockMvc.perform(get("/api/matches/" + match.getId()).param("userId", user1.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matchedUserName").value("Bob"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.event.title").value("Dune"));
    }

    @Test
    @WithMockUser(username = "m1@test.com")
    void getMatch_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/matches/9999").param("userId", "1"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "m1@test.com")
    void acceptMatch_changesStatus() throws Exception {
        mockMvc.perform(put("/api/matches/" + match.getId() + "/accept")
                        .param("userId", user1.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));
    }

    @Test
    @WithMockUser(username = "m1@test.com")
    void rejectMatch_changesStatus() throws Exception {
        mockMvc.perform(put("/api/matches/" + match.getId() + "/reject")
                        .param("userId", user1.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }
}
