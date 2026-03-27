package com.kulto.service;

import com.kulto.domain.*;
import com.kulto.dto.EventResponse;
import com.kulto.dto.MatchResponse;
import com.kulto.exception.ResourceNotFoundException;
import com.kulto.repository.EventInterestRepository;
import com.kulto.repository.EventRepository;
import com.kulto.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchingService {

    private static final double MATCH_THRESHOLD = 0.3;
    private static final int DAILY_MATCH_QUOTA = 5;
    private static final int MATCH_EXPIRY_HOURS = 48;

    private final EventInterestRepository interestRepository;
    private final MatchRepository matchRepository;
    private final EventRepository eventRepository;
    private final EventService eventService;

    /** Express interest and trigger matching */
    @Transactional
    public void expressInterest(User user, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventId));

        if (interestRepository.existsByUserAndEvent(user, event)) {
            return; // idempotent
        }

        EventInterest interest = EventInterest.builder().user(user).event(event).build();
        interestRepository.save(interest);

        tryCreateMatches(user, event);
    }

    /** Remove interest */
    @Transactional
    public void removeInterest(User user, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventId));
        interestRepository.deleteByUserAndEvent(user, event);
    }

    /** Get pending match proposals for a user */
    public List<MatchResponse> getPendingMatches(User user) {
        return matchRepository.findPendingForUser(user).stream()
                .map(m -> toResponse(m, user))
                .toList();
    }

    /** Get confirmed outings for a user */
    public List<MatchResponse> getConfirmedOutings(User user) {
        return matchRepository.findConfirmedForUser(user).stream()
                .map(m -> toResponse(m, user))
                .toList();
    }

    /** Accept a match */
    @Transactional
    public MatchResponse acceptMatch(User user, Long matchId) {
        Match match = getMatchForUser(user, matchId);
        setUserResponse(match, user, true);
        if (Boolean.TRUE.equals(match.getUser1Accepted()) && Boolean.TRUE.equals(match.getUser2Accepted())) {
            match.setStatus(MatchStatus.CONFIRMED);
        }
        return toResponse(matchRepository.save(match), user);
    }

    /** Reject a match */
    @Transactional
    public MatchResponse rejectMatch(User user, Long matchId) {
        Match match = getMatchForUser(user, matchId);
        setUserResponse(match, user, false);
        match.setStatus(MatchStatus.REJECTED);
        return toResponse(matchRepository.save(match), user);
    }

    // ── Internal ────────────────────────────────────────────────────────────

    private void tryCreateMatches(User newUser, Event event) {
        if (matchRepository.countTodayMatchesForUser(newUser, LocalDateTime.now().toLocalDate().atStartOfDay()) >= DAILY_MATCH_QUOTA) {
            log.debug("Daily quota reached for user {}", newUser.getId());
            return;
        }

        List<EventInterest> others = interestRepository.findByEventExcludingUser(event, newUser);
        for (EventInterest other : others) {
            User candidate = other.getUser();
            if (matchRepository.existsActiveMatchBetween(event, newUser, candidate)) continue;
            if (matchRepository.countTodayMatchesForUser(candidate, LocalDateTime.now().toLocalDate().atStartOfDay()) >= DAILY_MATCH_QUOTA) continue;

            double score = compatibilityScore(newUser, candidate);
            if (score < MATCH_THRESHOLD) continue;

            Match match = Match.builder()
                    .event(event)
                    .user1(newUser)
                    .user2(candidate)
                    .compatibilityScore(score)
                    .expiresAt(LocalDateTime.now().plusHours(MATCH_EXPIRY_HOURS))
                    .build();
            matchRepository.save(match);
            log.info("Match created: users {} & {} for event {}", newUser.getId(), candidate.getId(), event.getId());
            break; // one match per interest expression
        }
    }

    private double compatibilityScore(User a, User b) {
        List<String> tagsA = new ArrayList<>(a.getTasteTags());
        List<String> tagsB = new ArrayList<>(b.getTasteTags());
        List<EventCategory> catsA = new ArrayList<>(a.getPreferredCategories());
        List<EventCategory> catsB = new ArrayList<>(b.getPreferredCategories());

        long commonTags = tagsA.stream().filter(tagsB::contains).count();
        long commonCats = catsA.stream().filter(catsB::contains).count();

        long unionTags = tagsA.size() + tagsB.size() - commonTags;
        long unionCats = catsA.size() + catsB.size() - commonCats;

        if (unionTags == 0 && unionCats == 0) return 0.5; // both profiles empty → neutral
        double tagScore = unionTags > 0 ? (double) commonTags / unionTags : 0;
        double catScore = unionCats > 0 ? (double) commonCats / unionCats : 0;
        return (tagScore + catScore) / 2.0;
    }

    private Match getMatchForUser(User user, Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found: " + matchId));
        boolean involved = match.getUser1().getId().equals(user.getId())
                || match.getUser2().getId().equals(user.getId());
        if (!involved) throw new ResourceNotFoundException("Match not found: " + matchId);
        if (match.getStatus() != MatchStatus.PENDING) {
            throw new IllegalStateException("Match is no longer pending");
        }
        return match;
    }

    private void setUserResponse(Match match, User user, boolean accepted) {
        if (match.getUser1().getId().equals(user.getId())) {
            match.setUser1Accepted(accepted);
        } else {
            match.setUser2Accepted(accepted);
        }
    }

    private MatchResponse toResponse(Match match, User currentUser) {
        boolean isUser1 = match.getUser1().getId().equals(currentUser.getId());
        User other = isUser1 ? match.getUser2() : match.getUser1();
        Boolean myAccepted = isUser1 ? match.getUser1Accepted() : match.getUser2Accepted();
        Boolean theirAccepted = isUser1 ? match.getUser2Accepted() : match.getUser1Accepted();

        EventResponse eventResponse = eventService.toResponsePublic(match.getEvent(), 0, false);

        return MatchResponse.builder()
                .id(match.getId())
                .event(eventResponse)
                .matchedUser(AuthService.toProfileResponse(other))
                .compatibilityScore(match.getCompatibilityScore())
                .status(match.getStatus())
                .myAccepted(myAccepted)
                .theirAccepted(theirAccepted)
                .expiresAt(match.getExpiresAt())
                .createdAt(match.getCreatedAt())
                .build();
    }
}
