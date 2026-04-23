package com.kulto.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kulto.domain.User;
import com.kulto.dto.ContactLinkRequest;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper om;
    @Autowired private UserRepository userRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private MatchRepository matchRepository;
    @Autowired private PreferenceRepository preferenceRepository;
    @Autowired private EventRepository eventRepository;

    private User me;
    private User other;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        matchRepository.deleteAll();
        preferenceRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        me = userRepository.save(User.builder()
                .email("me@test.com").displayName("Me").passwordHash("h")
                .contactLink("@me_initial").build());
        other = userRepository.save(User.builder()
                .email("other@test.com").displayName("Other").passwordHash("h").build());
    }

    @Test
    @WithMockUser(username = "me@test.com")
    void getContactLink_ownResource_returnsLink() throws Exception {
        mockMvc.perform(get("/api/users/" + me.getId() + "/contact"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contactLink").value("@me_initial"));
    }

    @Test
    @WithMockUser(username = "me@test.com")
    void getContactLink_emptyWhenNull_returnsEmpty() throws Exception {
        me.setContactLink(null);
        userRepository.save(me);

        mockMvc.perform(get("/api/users/" + me.getId() + "/contact"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contactLink").value(""));
    }

    @Test
    @WithMockUser(username = "me@test.com")
    void getContactLink_otherUser_forbidden() throws Exception {
        mockMvc.perform(get("/api/users/" + other.getId() + "/contact"))
                .andExpect(result -> {
                    int s = result.getResponse().getStatus();
                    if (s != 403 && s != 401) throw new AssertionError("Expected 401/403 got " + s);
                });
    }

    @Test
    @WithMockUser(username = "me@test.com")
    void updateContactLink_validBody_persistsAndReturns() throws Exception {
        ContactLinkRequest req = new ContactLinkRequest();
        req.setContactLink("@new_handle");

        mockMvc.perform(put("/api/users/" + me.getId() + "/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contactLink").value("@new_handle"));

        // Read back
        mockMvc.perform(get("/api/users/" + me.getId() + "/contact"))
                .andExpect(jsonPath("$.contactLink").value("@new_handle"));
    }

    @Test
    @WithMockUser(username = "me@test.com")
    void updateContactLink_nullValue_returnsEmpty() throws Exception {
        ContactLinkRequest req = new ContactLinkRequest();
        req.setContactLink(null);

        mockMvc.perform(put("/api/users/" + me.getId() + "/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contactLink").value(""));
    }

    @Test
    @WithMockUser(username = "me@test.com")
    void updateContactLink_otherUser_forbidden() throws Exception {
        ContactLinkRequest req = new ContactLinkRequest();
        req.setContactLink("@hack");

        mockMvc.perform(put("/api/users/" + other.getId() + "/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(req)))
                .andExpect(result -> {
                    int s = result.getResponse().getStatus();
                    if (s != 403 && s != 401) throw new AssertionError("Expected 401/403 got " + s);
                });
    }

    @Test
    void getContactLink_unauthenticated_unauthorized() throws Exception {
        mockMvc.perform(get("/api/users/" + me.getId() + "/contact"))
                .andExpect(result -> {
                    int s = result.getResponse().getStatus();
                    if (s != 401 && s != 403) throw new AssertionError("Expected 401/403 got " + s);
                });
    }

    @Test
    @WithMockUser(username = "me@test.com")
    void updateContactLink_unknownUser_404() throws Exception {
        // Simulate authenticated user pointing at a user id that was deleted
        // Use own id but wipe it first
        Long id = me.getId();
        notificationRepository.deleteAll();
        matchRepository.deleteAll();
        preferenceRepository.deleteAll();
        userRepository.deleteById(id);
        // Re-create user-with-same-email so auth works, different id
        userRepository.save(User.builder()
                .email("me@test.com").displayName("Me").passwordHash("h").build());

        ContactLinkRequest req = new ContactLinkRequest();
        req.setContactLink("@x");
        mockMvc.perform(put("/api/users/" + id + "/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(req)))
                .andExpect(result -> {
                    int s = result.getResponse().getStatus();
                    if (s != 403 && s != 404) throw new AssertionError("Expected 403/404 got " + s);
                });
    }
}
