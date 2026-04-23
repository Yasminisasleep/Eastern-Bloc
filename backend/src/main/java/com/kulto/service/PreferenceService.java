package com.kulto.service;

import com.kulto.domain.EventCategory;
import com.kulto.domain.Gender;
import com.kulto.domain.Preference;
import com.kulto.domain.User;
import com.kulto.dto.PreferenceRequest;
import com.kulto.dto.PreferenceResponse;
import com.kulto.exception.ResourceNotFoundException;
import com.kulto.repository.MatchRepository;
import com.kulto.repository.PreferenceRepository;
import com.kulto.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PreferenceService {

    private final PreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final MatchRepository matchRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    public PreferenceResponse getPreferences(Long userId) {
        Preference pref = preferenceRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Preferences not found for user " + userId));
        return toResponse(pref);
    }

    public PreferenceResponse savePreferences(Long userId, PreferenceRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Preference pref = preferenceRepository.findByUserId(userId)
                .orElse(Preference.builder().user(user).build());

        pref.setPreferredCategories(
                request.getPreferredCategories().stream()
                        .map(c -> EventCategory.valueOf(c.toUpperCase()))
                        .collect(Collectors.toList())
        );
        pref.setInterestTags(request.getInterestTags());
        pref.setGeographicRadiusKm(request.getGeographicRadiusKm());

        // Demographics / targeting
        if (request.getPreferredGenders() != null) {
            pref.setPreferredGenders(
                    request.getPreferredGenders().stream()
                            .map(g -> Gender.valueOf(g.toUpperCase()))
                            .collect(Collectors.toList())
            );
        }
        pref.setPreferredAgeMin(request.getPreferredAgeMin());
        pref.setPreferredAgeMax(request.getPreferredAgeMax());

        // Update the User own age / gender
        if (request.getAge() != null) user.setAge(request.getAge());
        if (request.getGender() != null && !request.getGender().isBlank()) {
            user.setGender(Gender.valueOf(request.getGender().toUpperCase()));
        }
        userRepository.save(user);

        preferenceRepository.save(pref);

        int cancelled = matchRepository.cancelPendingMatchesForUser(userId);
        if (cancelled > 0) {
            log.info("Cancelled {} pending matches for user {} after preference change", cancelled, userId);
        }

        try {
            String payload = "{\"userId\":" + userId + "}";
            kafkaTemplate.send("user.preferences.updated", payload);
            log.info("Published preference update for user {}", userId);
        } catch (Exception e) {
            log.warn("Failed to publish preference update to Kafka: {}", e.getMessage());
        }

        return toResponse(pref);
    }

    private PreferenceResponse toResponse(Preference pref) {
        User u = pref.getUser();
        return PreferenceResponse.builder()
                .preferredCategories(
                        pref.getPreferredCategories().stream()
                                .map(Enum::name)
                                .collect(Collectors.toList())
                )
                .interestTags(pref.getInterestTags())
                .geographicRadiusKm(pref.getGeographicRadiusKm())
                .age(u != null ? u.getAge() : null)
                .gender(u != null && u.getGender() != null ? u.getGender().name() : null)
                .preferredGenders(pref.getPreferredGenders() == null ? java.util.Collections.emptyList()
                        : pref.getPreferredGenders().stream().map(Enum::name).collect(Collectors.toList()))
                .preferredAgeMin(pref.getPreferredAgeMin())
                .preferredAgeMax(pref.getPreferredAgeMax())
                .updatedAt(pref.getUpdatedAt() != null ? pref.getUpdatedAt().toString() : null)
                .build();
    }
}
