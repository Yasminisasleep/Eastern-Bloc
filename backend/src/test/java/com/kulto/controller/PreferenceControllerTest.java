package com.kulto.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kulto.domain.*;
import com.kulto.dto.PreferenceRequest;
import com.kulto.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PreferenceControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private PreferenceRepository preferenceRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private MatchRepository matchRepository;
    @Autowired private EventRepository eventRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        matchRepository.deleteAll();
        preferenceRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();
        testUser = userRepository.save(User.builder()
                .email("pref@test.com").displayName("Pref User").passwordHash("hash").build());
    }

    @Test
    @WithMockUser
    void savePreferences_validRequest_returnsOk() throws Exception {
        PreferenceRequest request = new PreferenceRequest();
        request.setPreferredCategories(List.of("CINEMA", "CONCERT"));
        request.setInterestTags(List.of("rock", "live"));
        request.setGeographicRadiusKm(25);

        mockMvc.perform(put("/api/users/" + testUser.getId() + "/preferences")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.preferredCategories[0]").value("CINEMA"))
                .andExpect(jsonPath("$.geographicRadiusKm").value(25));
    }

    @Test
    @WithMockUser
    void getPreferences_afterSave_returnsPreferences() throws Exception {
        Preference pref = Preference.builder()
                .user(testUser)
                .preferredCategories(List.of(EventCategory.CINEMA))
                .interestTags(List.of("sci-fi"))
                .geographicRadiusKm(30)
                .build();
        preferenceRepository.save(pref);

        mockMvc.perform(get("/api/users/" + testUser.getId() + "/preferences"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.preferredCategories[0]").value("CINEMA"))
                .andExpect(jsonPath("$.interestTags[0]").value("sci-fi"));
    }

    @Test
    @WithMockUser
    void getPreferences_noPreferences_returns404() throws Exception {
        mockMvc.perform(get("/api/users/" + testUser.getId() + "/preferences"))
                .andExpect(status().isNotFound());
    }
}
