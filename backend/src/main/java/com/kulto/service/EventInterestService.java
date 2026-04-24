package com.kulto.service;

import com.kulto.domain.*;
import com.kulto.exception.ResourceNotFoundException;
import com.kulto.repository.EventInterestRepository;
import com.kulto.repository.EventRepository;
import com.kulto.repository.MatchRepository;
import com.kulto.repository.PreferenceRepository;
import com.kulto.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EventInterestService {

    private final EventInterestRepository interestRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final PreferenceRepository preferenceRepository;
    private final MatchRepository matchRepository;
    private final NotificationService notificationService;
    private final MatchingService matchingService;
    private final KafkaTemplate<String, String> kafkaTemplate;

    public boolean hasInterest(Long userId, Long eventId) {
        return interestRepository.findByUserAndEvent(userId, eventId).isPresent();
    }

    public long count(Long eventId) {
        return interestRepository.countByEventId(eventId);
    }

    public void addInterest(Long userId, Long eventId) {
        if (interestRepository.findByUserAndEvent(userId, eventId).isPresent()) {
            return; // idempotent
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        EventInterest interest = EventInterest.builder()
                .user(user)
                .event(event)
                .createdAt(LocalDateTime.now())
                .build();
        interestRepository.save(interest);
        log.info("User {} expressed interest in event {}", userId, eventId);

        // Attempt to pair with any other interested user → create or upgrade Match
        List<EventInterest> others = interestRepository.findAllByEventId(eventId);
        for (EventInterest other : others) {
            pairWithOther(userId, eventId, user, event, other);
        }
    }

    private void pairWithOther(Long userId, Long eventId, User user, Event event, EventInterest other) {
        Long otherUserId = other.getUser().getId();
        if (otherUserId.equals(userId)) return;

        Optional<Preference> prefA = preferenceRepository.findByUserId(userId);
        Optional<Preference> prefB = preferenceRepository.findByUserId(otherUserId);

        // Demographic gate (if both set preferences, both must be mutually compatible)
        if (prefA.isPresent() && prefB.isPresent()
                && !matchingService.demographicsCompatible(user, prefA.get(), other.getUser(), prefB.get())) {
            log.debug("Skipping match user={} other={} — demographic mismatch", userId, otherUserId);
            return;
        }

        // If an active (pending/accepted) match already exists between these users,
        // upgrade it to point to THIS shared event instead of creating a duplicate.
        List<Match> existing = matchRepository.findActiveMatchesBetween(userId, otherUserId);
        if (!existing.isEmpty()) {
            Match m = existing.get(0);
            boolean changedEvent = (m.getEvent() == null || !eventId.equals(m.getEvent().getId()));
            if (changedEvent && m.getStatus() == MatchStatus.PENDING) {
                m.setEvent(event);
                // Bump score — shared-event signal is stronger than tag overlap alone
                double baseScore = m.getCompatibilityScore() == null ? 0.6 : m.getCompatibilityScore();
                m.setCompatibilityScore(Math.round(Math.max(baseScore, 0.75) * 100.0) / 100.0);
                matchRepository.save(m);
                notificationService.createMatchNotification(m);
                log.info("Upgraded existing match {} to shared event {} between {} and {}",
                        m.getId(), eventId, userId, otherUserId);
                try {
                    String payload = "{\"matchId\":" + m.getId() + ",\"source\":\"shared-event-upgrade\"}";
                    kafkaTemplate.send("match.notifications", payload);
                } catch (Exception e) {
                    log.warn("Failed to publish match upgrade notification: {}", e.getMessage());
                }
            }
            return;
        }

        double score = 0.7; // base score for shared interest in concrete event
        if (prefA.isPresent() && prefB.isPresent()) {
            double compat = matchingService.computeCompatibility(prefA.get(), prefB.get());
            score = Math.max(0.75, 0.5 + 0.5 * compat); // shared event → at least 0.75
        }

        Match match = Match.builder()
                .userOne(user)
                .userTwo(other.getUser())
                .event(event)
                .compatibilityScore(Math.round(score * 100.0) / 100.0)
                .status(MatchStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        matchRepository.save(match);
        log.info("Match created (shared-event) between {} and {} for event {} — score {}",
                userId, otherUserId, eventId, score);

        notificationService.createMatchNotification(match);

        try {
            String payload = "{\"matchId\":" + match.getId() + ",\"source\":\"shared-event\"}";
            kafkaTemplate.send("match.notifications", payload);
        } catch (Exception e) {
            log.warn("Failed to publish match notification: {}", e.getMessage());
        }
    }

    public void removeInterest(Long userId, Long eventId) {
        interestRepository.findByUserAndEvent(userId, eventId)
                .ifPresent(interestRepository::delete);
    }
}
