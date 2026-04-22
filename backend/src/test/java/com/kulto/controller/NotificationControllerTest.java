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
class NotificationControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private MatchRepository matchRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private EventRepository eventRepository;
    @Autowired private PreferenceRepository preferenceRepository;

    private User user1;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        matchRepository.deleteAll();
        preferenceRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        user1 = userRepository.save(User.builder()
                .email("n1@test.com").displayName("Alice").passwordHash("h").build());
        User user2 = userRepository.save(User.builder()
                .email("n2@test.com").displayName("Bob").passwordHash("h").build());

        Event event = eventRepository.save(Event.builder()
                .title("Dune").description("Film").category(EventCategory.CINEMA)
                .date(LocalDateTime.now().plusDays(10)).venue("MK2").city("Paris")
                .source("test").build());

        Match match = matchRepository.save(Match.builder()
                .userOne(user1).userTwo(user2).event(event)
                .compatibilityScore(0.8).status(MatchStatus.PENDING)
                .createdAt(LocalDateTime.now()).build());

        notificationRepository.save(Notification.builder()
                .user(user1).match(match)
                .message("New match with Bob!")
                .status(NotificationStatus.UNREAD)
                .createdAt(LocalDateTime.now()).build());
    }

    @Test
    @WithMockUser(username = "n1@test.com")
    void getNotifications_returnsList() throws Exception {
        mockMvc.perform(get("/api/users/" + user1.getId() + "/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].message").value("New match with Bob!"))
                .andExpect(jsonPath("$[0].status").value("UNREAD"))
                .andExpect(jsonPath("$[0].match.matchedUserName").value("Bob"));
    }

    @Test
    @WithMockUser(username = "n1@test.com")
    void getNotifications_noNotifications_returnsEmptyArray() throws Exception {
        notificationRepository.deleteAll();

        mockMvc.perform(get("/api/users/" + user1.getId() + "/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    @WithMockUser(username = "n2@test.com")
    void getNotifications_otherUserId_returns403() throws Exception {
        mockMvc.perform(get("/api/users/" + user1.getId() + "/notifications"))
                .andExpect(status().isForbidden());
    }
}
