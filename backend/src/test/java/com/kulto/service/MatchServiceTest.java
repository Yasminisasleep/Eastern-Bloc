package com.kulto.service;

import com.kulto.domain.*;
import com.kulto.dto.MatchResponse;
import com.kulto.exception.ResourceNotFoundException;
import com.kulto.repository.MatchRepository;
import com.kulto.repository.PreferenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchServiceTest {

    @Mock private MatchRepository matchRepository;
    @Mock private PreferenceRepository preferenceRepository;

    private MatchService matchService;

    private User user1;
    private User user2;
    private Event event;
    private Match pendingMatch;

    @BeforeEach
    void setUp() {
        matchService = new MatchService(matchRepository, preferenceRepository);

        user1 = User.builder().id(1L).email("u1@test.com").displayName("Alice").passwordHash("h").city("Paris").bio("Hello").build();
        user2 = User.builder().id(2L).email("u2@test.com").displayName("Bob").passwordHash("h").city("Lyon").build();

        event = Event.builder()
                .id(1L).title("Dune").category(EventCategory.CINEMA)
                .date(LocalDateTime.now().plusDays(10)).venue("MK2").city("Paris")
                .status(EventStatus.ACTIVE).build();

        pendingMatch = Match.builder()
                .id(1L).userOne(user1).userTwo(user2).event(event)
                .compatibilityScore(0.75).status(MatchStatus.PENDING)
                .createdAt(LocalDateTime.now()).build();
    }

    @Test
    void getMatch_existingMatch_returnsResponse() {
        when(matchRepository.findById(1L)).thenReturn(Optional.of(pendingMatch));
        when(preferenceRepository.findByUserId(2L)).thenReturn(Optional.of(
                Preference.builder().interestTags(List.of("sci-fi", "art")).preferredCategories(Collections.emptyList()).build()
        ));

        MatchResponse response = matchService.getMatch(1L, 1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("PENDING", response.getStatus());
        assertEquals(0.75, response.getCompatibilityScore());
        assertEquals("Bob", response.getMatchedUserName());
        assertEquals("Lyon", response.getMatchedUserCity());
        assertNotNull(response.getEvent());
        assertEquals("Dune", response.getEvent().getTitle());
        assertEquals(List.of("sci-fi", "art"), response.getMatchedUserTags());
    }

    @Test
    void getMatch_asUserTwo_showsUserOneAsMatched() {
        when(matchRepository.findById(1L)).thenReturn(Optional.of(pendingMatch));
        when(preferenceRepository.findByUserId(1L)).thenReturn(Optional.empty());

        MatchResponse response = matchService.getMatch(1L, 2L);

        assertEquals("Alice", response.getMatchedUserName());
        assertEquals("Paris", response.getMatchedUserCity());
        assertEquals("Hello", response.getMatchedUserBio());
    }

    @Test
    void getMatch_nonExistent_throwsException() {
        when(matchRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> matchService.getMatch(99L, 1L));
    }

    @Test
    void acceptMatch_pendingMatch_changesStatusToAccepted() {
        when(matchRepository.findById(1L)).thenReturn(Optional.of(pendingMatch));
        when(matchRepository.save(any(Match.class))).thenAnswer(inv -> inv.getArgument(0));
        when(preferenceRepository.findByUserId(2L)).thenReturn(Optional.empty());

        MatchResponse response = matchService.acceptMatch(1L, 1L);

        assertEquals("ACCEPTED", response.getStatus());
        verify(matchRepository).save(any(Match.class));
    }

    @Test
    void acceptMatch_nonPendingMatch_throwsException() {
        pendingMatch.setStatus(MatchStatus.ACCEPTED);
        when(matchRepository.findById(1L)).thenReturn(Optional.of(pendingMatch));

        assertThrows(IllegalStateException.class, () -> matchService.acceptMatch(1L, 1L));
    }

    @Test
    void rejectMatch_pendingMatch_changesStatusToRejected() {
        when(matchRepository.findById(1L)).thenReturn(Optional.of(pendingMatch));
        when(matchRepository.save(any(Match.class))).thenAnswer(inv -> inv.getArgument(0));
        when(preferenceRepository.findByUserId(2L)).thenReturn(Optional.empty());

        MatchResponse response = matchService.rejectMatch(1L, 1L);

        assertEquals("REJECTED", response.getStatus());
    }

    @Test
    void rejectMatch_nonPendingMatch_throwsException() {
        pendingMatch.setStatus(MatchStatus.REJECTED);
        when(matchRepository.findById(1L)).thenReturn(Optional.of(pendingMatch));

        assertThrows(IllegalStateException.class, () -> matchService.rejectMatch(1L, 1L));
    }

    @Test
    void getMatch_withNullEvent_returnsNullEventInResponse() {
        pendingMatch.setEvent(null);
        when(matchRepository.findById(1L)).thenReturn(Optional.of(pendingMatch));
        when(preferenceRepository.findByUserId(2L)).thenReturn(Optional.empty());

        MatchResponse response = matchService.getMatch(1L, 1L);

        assertNull(response.getEvent());
    }

    @Test
    void acceptMatch_nonExistentMatch_throwsException() {
        when(matchRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> matchService.acceptMatch(99L, 1L));
    }

    @Test
    void rejectMatch_nonExistentMatch_throwsException() {
        when(matchRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> matchService.rejectMatch(99L, 1L));
    }
}
