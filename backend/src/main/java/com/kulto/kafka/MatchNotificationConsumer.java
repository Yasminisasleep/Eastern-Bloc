package com.kulto.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kulto.domain.Match;
import com.kulto.repository.MatchRepository;
import com.kulto.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class MatchNotificationConsumer {

    private final NotificationService notificationService;
    private final MatchRepository matchRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "match.notifications", groupId = "kulto-group")
    public void consume(String message) {
        try {
            Map<String, Object> payload = objectMapper.readValue(message, Map.class);
            Long matchId = ((Number) payload.get("matchId")).longValue();
            log.info("Received match notification event for match {}", matchId);
        } catch (Exception e) {
            log.error("Failed to process match notification: {}", e.getMessage());
        }
    }
}
