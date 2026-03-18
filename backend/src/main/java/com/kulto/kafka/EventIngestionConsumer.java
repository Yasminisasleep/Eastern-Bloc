package com.kulto.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kulto.domain.Event;
import com.kulto.domain.EventCategory;
import com.kulto.dto.KafkaEventMessage;
import com.kulto.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventIngestionConsumer {

    private final EventRepository eventRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "events.ingestion", groupId = "kulto-group")
    public void consume(String message) {
        try {
            KafkaEventMessage msg = objectMapper.readValue(message, KafkaEventMessage.class);
            Event event = Event.builder()
                    .title(msg.getTitle())
                    .description(msg.getDescription())
                    .category(EventCategory.valueOf(msg.getCategory().toUpperCase()))
                    .date(msg.getDate())
                    .venue(msg.getVenue())
                    .city(msg.getCity())
                    .source(msg.getSource())
                    .tags(msg.getTags())
                    .build();
            eventRepository.save(event);
            log.info("Ingested event: {}", event.getTitle());
        } catch (Exception e) {
            log.error("Failed to process event message: {}", e.getMessage());
        }
    }
}
