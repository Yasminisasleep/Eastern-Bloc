package com.kulto.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventIngestionController {

    private final KafkaTemplate<String, String> kafkaTemplate;

    @PostMapping("/ingest")
    public ResponseEntity<Map<String, String>> ingest(@RequestBody String payload) {
        kafkaTemplate.send("events.ingestion", payload);
        return ResponseEntity.ok(Map.of("status", "sent"));
    }
}
