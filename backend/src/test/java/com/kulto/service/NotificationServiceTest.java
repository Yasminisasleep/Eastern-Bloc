package com.kulto.service;

import com.kulto.domain.*;
import com.kulto.dto.NotificationResponse;
import com.kulto.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    private NotificationService notificationService;

    private User user1;
    private User user2;
    private Event event;
    private Match match;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService(notificationRepository);

        user1 = User.builder().id(1L).email("u1@test.com").displayName("Alice").passwordHash("h").build();
        user2 = User.builder().id(2L).email("u2@test.com").displayName("Bob").passwordHash("h").build();

        event = Event.builder()
                .id(1L).title("Dune").category(EventCategory.CINEMA)
                .date(LocalDateTime.now().plusDays(10)).venue("MK2").city("Paris")
                .status(EventStatus.ACTIVE).build();

        match = Match.builder()
                .id(1L).userOne(user1).userTwo(user2).event(event)
                .compatibilityScore(0.75).status(MatchStatus.PENDING)
                .createdAt(LocalDateTime.now()).build();
    }

    @Test
    void createMatchNotification_createsTwoNotifications() {
        notificationService.createMatchNotification(match);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(2)).save(captor.capture());

        List<Notification> saved = captor.getAllValues();
        assertEquals(2, saved.size());

        Notification notif1 = saved.get(0);
        assertEquals(user1, notif1.getUser());
        assertTrue(notif1.getMessage().contains("Bob"));
        assertEquals(NotificationStatus.UNREAD, notif1.getStatus());

        Notification notif2 = saved.get(1);
        assertEquals(user2, notif2.getUser());
        assertTrue(notif2.getMessage().contains("Alice"));
    }

    @Test
    void getNotifications_returnsFormattedList() {
        Notification notif = Notification.builder()
                .id(1L).user(user1).match(match)
                .message("New match with Bob!")
                .status(NotificationStatus.UNREAD)
                .createdAt(LocalDateTime.of(2026, 4, 13, 10, 0))
                .build();

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(notif));

        List<NotificationResponse> responses = notificationService.getNotifications(1L);

        assertEquals(1, responses.size());
        NotificationResponse response = responses.get(0);
        assertEquals(1L, response.getId());
        assertEquals("UNREAD", response.getStatus());
        assertEquals("New match with Bob!", response.getMessage());
        assertNotNull(response.getMatch());
        assertEquals(1L, response.getMatch().getId());
        assertEquals("Bob", response.getMatch().getMatchedUserName());
        assertEquals("Dune", response.getMatch().getEvent().getTitle());
    }

    @Test
    void getNotifications_emptyList_returnsEmpty() {
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        List<NotificationResponse> responses = notificationService.getNotifications(1L);

        assertTrue(responses.isEmpty());
    }

    @Test
    void getNotifications_matchWithNoEvent_returnsNullEvent() {
        Match noEventMatch = Match.builder()
                .id(2L).userOne(user1).userTwo(user2).event(null)
                .compatibilityScore(0.5).status(MatchStatus.PENDING)
                .createdAt(LocalDateTime.now()).build();

        Notification notif = Notification.builder()
                .id(2L).user(user1).match(noEventMatch)
                .message("New match!")
                .status(NotificationStatus.UNREAD)
                .createdAt(LocalDateTime.now())
                .build();

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(notif));

        List<NotificationResponse> responses = notificationService.getNotifications(1L);

        assertEquals(1, responses.size());
        assertNull(responses.get(0).getMatch().getEvent());
    }
}
