package com.kulto.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kulto.service.MatchingService;
import com.kulto.service.NotificationService;
import com.kulto.domain.Match;
import com.kulto.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class PreferenceUpdatedConsumer {

    private final MatchingService matchingService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "user.preferences.updated", groupId = "kulto-group")
    public void consume(String message) {
        try {
            Map<String, Object> payload = objectMapper.readValue(message, Map.class);
            Long userId = ((Number) payload.get("userId")).longValue();
            log.info("Received preference update for user {}, triggering matching", userId);
            matchingService.generateMatchesForUser(userId);
        } catch (Exception e) {
            log.error("Failed to process preference update: {}", e.getMessage());
        }
    }
}
