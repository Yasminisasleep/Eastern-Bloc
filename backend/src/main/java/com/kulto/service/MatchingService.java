package com.kulto.service;

import com.kulto.domain.*;
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
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MatchingService {

    private final UserRepository userRepository;
    private final PreferenceRepository preferenceRepository;
    private final MatchRepository matchRepository;
    private final EventRepository eventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final NotificationService notificationService;

    public void generateMatchesForUser(Long userId) {
        Optional<Preference> userPrefOpt = preferenceRepository.findByUserId(userId);
        if (userPrefOpt.isEmpty()) {
            log.info("No preferences found for user {}, skipping matching", userId);
            return;
        }

        Preference userPref = userPrefOpt.get();
        List<User> allUsers = userRepository.findAll();

        for (User otherUser : allUsers) {
            if (otherUser.getId().equals(userId)) continue;
            if (matchRepository.existsActiveMatchBetween(userId, otherUser.getId())) continue;

            Optional<Preference> otherPrefOpt = preferenceRepository.findByUserId(otherUser.getId());
            if (otherPrefOpt.isEmpty()) continue;

            Preference otherPref = otherPrefOpt.get();
            double score = computeCompatibility(userPref, otherPref);

            if (score >= 0.2) {
                Event sharedEvent = findSharedEvent(userPref, otherPref);

                Match match = Match.builder()
                        .userOne(userPref.getUser())
                        .userTwo(otherUser)
                        .event(sharedEvent)
                        .compatibilityScore(Math.round(score * 100.0) / 100.0)
                        .status(MatchStatus.PENDING)
                        .createdAt(LocalDateTime.now())
                        .build();

                matchRepository.save(match);
                log.info("Created match between user {} and user {} with score {}", userId, otherUser.getId(), score);

                notificationService.createMatchNotification(match);

                try {
                    String payload = "{\"matchId\":" + match.getId() + "}";
                    kafkaTemplate.send("match.notifications", payload);
                } catch (Exception e) {
                    log.warn("Failed to publish match notification to Kafka: {}", e.getMessage());
                }
            }
        }
    }

    double computeCompatibility(Preference a, Preference b) {
        Set<String> tagsA = new HashSet<>(a.getInterestTags());
        Set<String> tagsB = new HashSet<>(b.getInterestTags());

        Set<String> categoriesA = a.getPreferredCategories().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());
        Set<String> categoriesB = b.getPreferredCategories().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());

        Set<String> sharedTags = new HashSet<>(tagsA);
        sharedTags.retainAll(tagsB);

        Set<String> sharedCategories = new HashSet<>(categoriesA);
        sharedCategories.retainAll(categoriesB);

        Set<String> allTags = new HashSet<>(tagsA);
        allTags.addAll(tagsB);

        Set<String> allCategories = new HashSet<>(categoriesA);
        allCategories.addAll(categoriesB);

        double tagScore = allTags.isEmpty() ? 0 : (double) sharedTags.size() / allTags.size();
        double categoryScore = allCategories.isEmpty() ? 0 : (double) sharedCategories.size() / allCategories.size();

        return 0.6 * tagScore + 0.4 * categoryScore;
    }

    private Event findSharedEvent(Preference a, Preference b) {
        Set<String> sharedCategories = a.getPreferredCategories().stream()
                .map(Enum::name)
                .filter(c -> b.getPreferredCategories().stream().map(Enum::name).anyMatch(c::equals))
                .collect(Collectors.toSet());

        if (!sharedCategories.isEmpty()) {
            String category = sharedCategories.iterator().next();
            List<Event> events = eventRepository.findAll().stream()
                    .filter(e -> e.getStatus() == EventStatus.ACTIVE)
                    .filter(e -> e.getCategory().name().equals(category))
                    .filter(e -> e.getDate().isAfter(LocalDateTime.now()))
                    .toList();
            if (!events.isEmpty()) {
                return events.get(0);
            }
        }

        return eventRepository.findAll().stream()
                .filter(e -> e.getStatus() == EventStatus.ACTIVE)
                .filter(e -> e.getDate().isAfter(LocalDateTime.now()))
                .findFirst()
                .orElse(null);
    }
}
