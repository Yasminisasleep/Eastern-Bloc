package com.kulto.service;

import com.kulto.domain.*;
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
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchingServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PreferenceRepository preferenceRepository;
    @Mock private MatchRepository matchRepository;
    @Mock private EventRepository eventRepository;
    @Mock private KafkaTemplate<String, String> kafkaTemplate;
    @Mock private NotificationService notificationService;

    private MatchingService matchingService;

    private User user1;
    private User user2;
    private Preference pref1;
    private Preference pref2;

    @BeforeEach
    void setUp() {
        matchingService = new MatchingService(
                userRepository, preferenceRepository, matchRepository,
                eventRepository, kafkaTemplate, notificationService);

        user1 = User.builder().id(1L).email("u1@test.com").displayName("User One").passwordHash("h").build();
        user2 = User.builder().id(2L).email("u2@test.com").displayName("User Two").passwordHash("h").build();

        pref1 = Preference.builder()
                .id(1L).user(user1)
                .preferredCategories(List.of(EventCategory.CINEMA, EventCategory.CONCERT))
                .interestTags(List.of("sci-fi", "electronic", "live"))
                .geographicRadiusKm(30).build();

        pref2 = Preference.builder()
                .id(2L).user(user2)
                .preferredCategories(List.of(EventCategory.CINEMA, EventCategory.EXHIBITION))
                .interestTags(List.of("sci-fi", "art", "photography"))
                .geographicRadiusKm(50).build();
    }

    @Test
    void computeCompatibility_sharedTagsAndCategories_returnsExpectedScore() {
        double score = matchingService.computeCompatibility(pref1, pref2);

        double expectedTagScore = 1.0 / 5.0;
        double expectedCatScore = 1.0 / 3.0;
        double expected = 0.6 * expectedTagScore + 0.4 * expectedCatScore;

        assertEquals(expected, score, 0.001);
    }

    @Test
    void computeCompatibility_identicalPreferences_returnsOne() {
        Preference identical = Preference.builder()
                .preferredCategories(List.of(EventCategory.CINEMA))
                .interestTags(List.of("sci-fi"))
                .build();

        double score = matchingService.computeCompatibility(identical, identical);

        assertEquals(1.0, score, 0.001);
    }

    @Test
    void computeCompatibility_noOverlap_returnsZero() {
        Preference a = Preference.builder()
                .preferredCategories(List.of(EventCategory.CINEMA))
                .interestTags(List.of("rock"))
                .build();
        Preference b = Preference.builder()
                .preferredCategories(List.of(EventCategory.THEATRE))
                .interestTags(List.of("jazz"))
                .build();

        double score = matchingService.computeCompatibility(a, b);

        assertEquals(0.0, score, 0.001);
    }

    @Test
    void computeCompatibility_emptyTags_handlesGracefully() {
        Preference a = Preference.builder()
                .preferredCategories(List.of(EventCategory.CINEMA))
                .interestTags(Collections.emptyList())
                .build();
        Preference b = Preference.builder()
                .preferredCategories(List.of(EventCategory.CINEMA))
                .interestTags(Collections.emptyList())
                .build();

        double score = matchingService.computeCompatibility(a, b);

        assertEquals(0.4, score, 0.001);
    }

    @Test
    void generateMatchesForUser_noPreferences_doesNothing() {
        when(preferenceRepository.findByUserId(1L)).thenReturn(Optional.empty());

        matchingService.generateMatchesForUser(1L);

        verify(matchRepository, never()).save(any());
        verify(notificationService, never()).createMatchNotification(any());
    }

    @Test
    void generateMatchesForUser_withCompatibleUser_createsMatch() {
        when(preferenceRepository.findByUserId(1L)).thenReturn(Optional.of(pref1));
        when(userRepository.findAll()).thenReturn(List.of(user1, user2));
        when(preferenceRepository.findByUserId(2L)).thenReturn(Optional.of(pref2));
        when(matchRepository.existsActiveMatchBetween(1L, 2L)).thenReturn(false);
        when(eventRepository.findAll()).thenReturn(Collections.emptyList());
        when(matchRepository.save(any(Match.class))).thenAnswer(inv -> {
            Match m = inv.getArgument(0);
            m.setId(1L);
            return m;
        });

        matchingService.generateMatchesForUser(1L);

        ArgumentCaptor<Match> captor = ArgumentCaptor.forClass(Match.class);
        verify(matchRepository).save(captor.capture());
        Match created = captor.getValue();

        assertEquals(user1, created.getUserOne());
        assertEquals(user2, created.getUserTwo());
        assertEquals(MatchStatus.PENDING, created.getStatus());
        assertTrue(created.getCompatibilityScore() > 0);

        verify(notificationService).createMatchNotification(any(Match.class));
    }

    @Test
    void generateMatchesForUser_existingMatch_skips() {
        when(preferenceRepository.findByUserId(1L)).thenReturn(Optional.of(pref1));
        when(userRepository.findAll()).thenReturn(List.of(user1, user2));
        when(matchRepository.existsActiveMatchBetween(1L, 2L)).thenReturn(true);

        matchingService.generateMatchesForUser(1L);

        verify(matchRepository, never()).save(any());
    }

    @Test
    void generateMatchesForUser_otherUserNoPreferences_skips() {
        when(preferenceRepository.findByUserId(1L)).thenReturn(Optional.of(pref1));
        when(userRepository.findAll()).thenReturn(List.of(user1, user2));
        when(matchRepository.existsActiveMatchBetween(1L, 2L)).thenReturn(false);
        when(preferenceRepository.findByUserId(2L)).thenReturn(Optional.empty());

        matchingService.generateMatchesForUser(1L);

        verify(matchRepository, never()).save(any());
    }

    @Test
    void generateMatchesForUser_lowCompatibility_doesNotMatch() {
        Preference incompatible = Preference.builder()
                .id(3L).user(user2)
                .preferredCategories(List.of(EventCategory.THEATRE))
                .interestTags(List.of("classical", "ballet", "opera", "drama", "poetry",
                        "literature", "renaissance", "baroque", "romantic", "contemporary"))
                .geographicRadiusKm(10).build();

        when(preferenceRepository.findByUserId(1L)).thenReturn(Optional.of(pref1));
        when(userRepository.findAll()).thenReturn(List.of(user1, user2));
        when(matchRepository.existsActiveMatchBetween(1L, 2L)).thenReturn(false);
        when(preferenceRepository.findByUserId(2L)).thenReturn(Optional.of(incompatible));

        matchingService.generateMatchesForUser(1L);

        verify(matchRepository, never()).save(any());
    }

    // --- demographicsCompatible --------------------------------------------

    @Test
    void demographicsCompatible_noFilters_returnsTrue() {
        User a = User.builder().id(1L).age(25).gender(Gender.FEMALE).build();
        User b = User.builder().id(2L).age(30).gender(Gender.MALE).build();
        Preference pa = Preference.builder().user(a).build();
        Preference pb = Preference.builder().user(b).build();

        assertTrue(matchingService.demographicsCompatible(a, pa, b, pb));
    }

    @Test
    void demographicsCompatible_genderMatch_returnsTrue() {
        User a = User.builder().id(1L).age(25).gender(Gender.FEMALE).build();
        User b = User.builder().id(2L).age(30).gender(Gender.MALE).build();
        Preference pa = Preference.builder().user(a)
                .preferredGenders(List.of(Gender.MALE)).build();
        Preference pb = Preference.builder().user(b)
                .preferredGenders(List.of(Gender.FEMALE)).build();

        assertTrue(matchingService.demographicsCompatible(a, pa, b, pb));
    }

    @Test
    void demographicsCompatible_genderMismatch_returnsFalse() {
        User a = User.builder().id(1L).age(25).gender(Gender.FEMALE).build();
        User b = User.builder().id(2L).age(30).gender(Gender.MALE).build();
        Preference pa = Preference.builder().user(a)
                .preferredGenders(List.of(Gender.FEMALE)).build();
        Preference pb = Preference.builder().user(b)
                .preferredGenders(List.of(Gender.FEMALE)).build();

        assertFalse(matchingService.demographicsCompatible(a, pa, b, pb));
    }

    @Test
    void demographicsCompatible_ageInRange_returnsTrue() {
        User a = User.builder().id(1L).age(28).build();
        User b = User.builder().id(2L).age(32).build();
        Preference pa = Preference.builder().user(a)
                .preferredAgeMin(25).preferredAgeMax(40).build();
        Preference pb = Preference.builder().user(b)
                .preferredAgeMin(20).preferredAgeMax(35).build();

        assertTrue(matchingService.demographicsCompatible(a, pa, b, pb));
    }

    @Test
    void demographicsCompatible_ageBelowMin_returnsFalse() {
        User a = User.builder().id(1L).age(22).build();
        User b = User.builder().id(2L).age(32).build();
        Preference pa = Preference.builder().user(a).build();
        Preference pb = Preference.builder().user(b)
                .preferredAgeMin(25).preferredAgeMax(35).build();

        assertFalse(matchingService.demographicsCompatible(a, pa, b, pb));
    }

    @Test
    void demographicsCompatible_ageAboveMax_returnsFalse() {
        User a = User.builder().id(1L).age(50).build();
        User b = User.builder().id(2L).age(32).build();
        Preference pa = Preference.builder().user(a).build();
        Preference pb = Preference.builder().user(b)
                .preferredAgeMin(25).preferredAgeMax(35).build();

        assertFalse(matchingService.demographicsCompatible(a, pa, b, pb));
    }

    @Test
    void demographicsCompatible_unknownGender_passesThrough() {
        User a = User.builder().id(1L).age(25).build();
        User b = User.builder().id(2L).age(30).gender(Gender.MALE).build();
        Preference pa = Preference.builder().user(a)
                .preferredGenders(List.of(Gender.MALE)).build();
        Preference pb = Preference.builder().user(b)
                .preferredGenders(List.of(Gender.FEMALE)).build();

        assertTrue(matchingService.demographicsCompatible(a, pa, b, pb));
    }
}
