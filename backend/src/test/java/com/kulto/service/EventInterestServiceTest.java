package com.kulto.service;

import com.kulto.domain.*;
import com.kulto.exception.ResourceNotFoundException;
import com.kulto.repository.EventInterestRepository;
import com.kulto.repository.EventRepository;
import com.kulto.repository.MatchRepository;
import com.kulto.repository.PreferenceRepository;
import com.kulto.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventInterestServiceTest {

    @Mock private EventInterestRepository interestRepository;
    @Mock private EventRepository eventRepository;
    @Mock private UserRepository userRepository;
    @Mock private PreferenceRepository preferenceRepository;
    @Mock private MatchRepository matchRepository;
    @Mock private NotificationService notificationService;
    @Mock private MatchingService matchingService;
    @Mock private KafkaTemplate<String, String> kafkaTemplate;

    private EventInterestService service;

    private User alice;
    private User bob;
    private Event event;
    private Preference prefA;
    private Preference prefB;

    @BeforeEach
    void setUp() {
        service = new EventInterestService(
                interestRepository, eventRepository, userRepository,
                preferenceRepository, matchRepository,
                notificationService, matchingService, kafkaTemplate);

        alice = User.builder().id(1L).email("a@test.com").displayName("Alice").passwordHash("h").build();
        bob = User.builder().id(2L).email("b@test.com").displayName("Bob").passwordHash("h").build();
        event = Event.builder().id(10L).title("Dune").category(EventCategory.CINEMA)
                .date(LocalDateTime.now().plusDays(5)).source("seed").build();

        prefA = Preference.builder().id(1L).user(alice)
                .preferredCategories(List.of(EventCategory.CINEMA))
                .interestTags(List.of("sci-fi"))
                .build();
        prefB = Preference.builder().id(2L).user(bob)
                .preferredCategories(List.of(EventCategory.CINEMA))
                .interestTags(List.of("sci-fi"))
                .build();
    }

    @Test
    void hasInterest_present_returnsTrue() {
        when(interestRepository.findByUserAndEvent(1L, 10L))
                .thenReturn(Optional.of(new EventInterest()));
        assertTrue(service.hasInterest(1L, 10L));
    }

    @Test
    void hasInterest_absent_returnsFalse() {
        when(interestRepository.findByUserAndEvent(1L, 10L)).thenReturn(Optional.empty());
        assertFalse(service.hasInterest(1L, 10L));
    }

    @Test
    void count_delegatesToRepository() {
        when(interestRepository.countByEventId(10L)).thenReturn(42L);
        assertEquals(42L, service.count(10L));
    }

    @Test
    void addInterest_alreadyExists_isIdempotent() {
        when(interestRepository.findByUserAndEvent(1L, 10L))
                .thenReturn(Optional.of(new EventInterest()));

        service.addInterest(1L, 10L);

        verify(interestRepository, never()).save(any());
        verify(matchRepository, never()).save(any());
    }

    @Test
    void addInterest_unknownUser_throws() {
        when(interestRepository.findByUserAndEvent(1L, 10L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.addInterest(1L, 10L));
    }

    @Test
    void addInterest_unknownEvent_throws() {
        when(interestRepository.findByUserAndEvent(1L, 10L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(alice));
        when(eventRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.addInterest(1L, 10L));
    }

    @Test
    void addInterest_noOtherInterested_savesInterestOnly() {
        when(interestRepository.findByUserAndEvent(1L, 10L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(alice));
        when(eventRepository.findById(10L)).thenReturn(Optional.of(event));
        when(interestRepository.findAllByEventId(10L)).thenReturn(List.of());

        service.addInterest(1L, 10L);

        verify(interestRepository).save(any(EventInterest.class));
        verify(matchRepository, never()).save(any());
        verify(notificationService, never()).createMatchNotification(any());
    }

    @Test
    void addInterest_otherInterested_createsMatchAndNotification() {
        EventInterest bobInterest = EventInterest.builder().user(bob).event(event).build();

        when(interestRepository.findByUserAndEvent(1L, 10L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(alice));
        when(eventRepository.findById(10L)).thenReturn(Optional.of(event));
        when(interestRepository.findAllByEventId(10L)).thenReturn(List.of(bobInterest));
        when(matchRepository.findActiveMatchesBetween(1L, 2L)).thenReturn(List.of());
        when(preferenceRepository.findByUserId(1L)).thenReturn(Optional.of(prefA));
        when(preferenceRepository.findByUserId(2L)).thenReturn(Optional.of(prefB));
        when(matchingService.demographicsCompatible(alice, prefA, bob, prefB)).thenReturn(true);
        when(matchingService.computeCompatibility(prefA, prefB)).thenReturn(0.6);
        when(matchRepository.save(any(Match.class))).thenAnswer(inv -> {
            Match m = inv.getArgument(0);
            m.setId(99L);
            return m;
        });

        service.addInterest(1L, 10L);

        ArgumentCaptor<Match> captor = ArgumentCaptor.forClass(Match.class);
        verify(matchRepository).save(captor.capture());
        Match created = captor.getValue();
        assertEquals(alice, created.getUserOne());
        assertEquals(bob, created.getUserTwo());
        assertEquals(event, created.getEvent());
        assertEquals(MatchStatus.PENDING, created.getStatus());
        assertTrue(created.getCompatibilityScore() >= 0.75);

        verify(notificationService).createMatchNotification(any(Match.class));
        verify(kafkaTemplate).send(eq("match.notifications"), anyString());
    }

    @Test
    void addInterest_skipsSelf() {
        EventInterest selfInterest = EventInterest.builder().user(alice).event(event).build();

        when(interestRepository.findByUserAndEvent(1L, 10L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(alice));
        when(eventRepository.findById(10L)).thenReturn(Optional.of(event));
        when(interestRepository.findAllByEventId(10L)).thenReturn(List.of(selfInterest));

        service.addInterest(1L, 10L);

        verify(matchRepository, never()).save(any());
    }

    @Test
    void addInterest_existingActiveMatch_upgradesEventAndNotifies() {
        EventInterest bobInterest = EventInterest.builder().user(bob).event(event).build();
        Event otherEvent = Event.builder().id(99L).title("Old").category(EventCategory.CONCERT)
                .date(LocalDateTime.now().plusDays(2)).source("seed").build();
        Match existing = Match.builder().id(55L)
                .userOne(alice).userTwo(bob)
                .event(otherEvent) // was pointing to a different event
                .compatibilityScore(0.5)
                .status(MatchStatus.PENDING)
                .createdAt(LocalDateTime.now()).build();

        when(interestRepository.findByUserAndEvent(1L, 10L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(alice));
        when(eventRepository.findById(10L)).thenReturn(Optional.of(event));
        when(interestRepository.findAllByEventId(10L)).thenReturn(List.of(bobInterest));
        when(preferenceRepository.findByUserId(1L)).thenReturn(Optional.of(prefA));
        when(preferenceRepository.findByUserId(2L)).thenReturn(Optional.of(prefB));
        when(matchingService.demographicsCompatible(alice, prefA, bob, prefB)).thenReturn(true);
        when(matchRepository.findActiveMatchesBetween(1L, 2L)).thenReturn(List.of(existing));

        service.addInterest(1L, 10L);

        // Match should be upgraded: event now points to the shared one, score bumped ≥ 0.75
        verify(matchRepository).save(existing);
        assertEquals(event, existing.getEvent());
        assertTrue(existing.getCompatibilityScore() >= 0.75);
        verify(notificationService).createMatchNotification(existing);
        // No NEW match built
        verify(matchRepository, never()).save(argThat(m -> m != existing));
    }

    @Test
    void addInterest_existingActiveMatchOnSameEvent_noUpgrade() {
        EventInterest bobInterest = EventInterest.builder().user(bob).event(event).build();
        Match existing = Match.builder().id(55L)
                .userOne(alice).userTwo(bob)
                .event(event) // already on the shared event
                .compatibilityScore(0.8)
                .status(MatchStatus.PENDING)
                .createdAt(LocalDateTime.now()).build();

        when(interestRepository.findByUserAndEvent(1L, 10L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(alice));
        when(eventRepository.findById(10L)).thenReturn(Optional.of(event));
        when(interestRepository.findAllByEventId(10L)).thenReturn(List.of(bobInterest));
        when(preferenceRepository.findByUserId(1L)).thenReturn(Optional.of(prefA));
        when(preferenceRepository.findByUserId(2L)).thenReturn(Optional.of(prefB));
        when(matchingService.demographicsCompatible(alice, prefA, bob, prefB)).thenReturn(true);
        when(matchRepository.findActiveMatchesBetween(1L, 2L)).thenReturn(List.of(existing));

        service.addInterest(1L, 10L);

        // No save, no new notification
        verify(matchRepository, never()).save(any(Match.class));
        verify(notificationService, never()).createMatchNotification(any());
    }

    @Test
    void addInterest_demographicMismatch_skips() {
        EventInterest bobInterest = EventInterest.builder().user(bob).event(event).build();

        when(interestRepository.findByUserAndEvent(1L, 10L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(alice));
        when(eventRepository.findById(10L)).thenReturn(Optional.of(event));
        when(interestRepository.findAllByEventId(10L)).thenReturn(List.of(bobInterest));
        when(preferenceRepository.findByUserId(1L)).thenReturn(Optional.of(prefA));
        when(preferenceRepository.findByUserId(2L)).thenReturn(Optional.of(prefB));
        when(matchingService.demographicsCompatible(alice, prefA, bob, prefB)).thenReturn(false);

        service.addInterest(1L, 10L);

        verify(matchRepository, never()).save(any());
        verify(notificationService, never()).createMatchNotification(any());
    }

    @Test
    void addInterest_kafkaFails_doesNotThrow() {
        EventInterest bobInterest = EventInterest.builder().user(bob).event(event).build();

        when(interestRepository.findByUserAndEvent(1L, 10L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(alice));
        when(eventRepository.findById(10L)).thenReturn(Optional.of(event));
        when(interestRepository.findAllByEventId(10L)).thenReturn(List.of(bobInterest));
        when(matchRepository.findActiveMatchesBetween(1L, 2L)).thenReturn(List.of());
        when(preferenceRepository.findByUserId(1L)).thenReturn(Optional.of(prefA));
        when(preferenceRepository.findByUserId(2L)).thenReturn(Optional.of(prefB));
        when(matchingService.demographicsCompatible(alice, prefA, bob, prefB)).thenReturn(true);
        when(matchingService.computeCompatibility(prefA, prefB)).thenReturn(0.4);
        when(matchRepository.save(any(Match.class))).thenAnswer(inv -> inv.getArgument(0));
        when(kafkaTemplate.send(anyString(), anyString()))
                .thenThrow(new RuntimeException("Kafka down"));

        assertDoesNotThrow(() -> service.addInterest(1L, 10L));
        verify(notificationService).createMatchNotification(any(Match.class));
    }

    @Test
    void removeInterest_present_deletes() {
        EventInterest existing = EventInterest.builder().id(7L).user(alice).event(event).build();
        when(interestRepository.findByUserAndEvent(1L, 10L)).thenReturn(Optional.of(existing));

        service.removeInterest(1L, 10L);

        verify(interestRepository).delete(existing);
    }

    @Test
    void removeInterest_absent_isNoop() {
        when(interestRepository.findByUserAndEvent(1L, 10L)).thenReturn(Optional.empty());

        service.removeInterest(1L, 10L);

        verify(interestRepository, never()).delete(any());
    }
}
