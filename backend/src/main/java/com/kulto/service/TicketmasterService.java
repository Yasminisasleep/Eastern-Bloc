package com.kulto.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kulto.domain.Event;
import com.kulto.domain.EventCategory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketmasterService {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${ticketmaster.api-key:}")
    private String apiKey;

    @Value("${ticketmaster.enabled:false}")
    private boolean enabled;

    public List<Event> fetchEventsFromTicketmaster(String city, int pageSize) {
        if (!enabled || apiKey == null || apiKey.isBlank()) {
            log.warn("Ticketmaster integration disabled or API key not configured");
            return List.of();
        }

        try {
            String url = String.format(
                    "https://app.ticketmaster.com/discovery/v2/events.json?city=%s&size=%d&apikey=%s",
                    city, pageSize, apiKey
            );

            WebClient webClient = webClientBuilder.build();
            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseTicketmasterResponse(response);
        } catch (Exception e) {
            log.error("Failed to fetch events from Ticketmaster for city {}: {}", city, e.getMessage());
            return List.of();
        }
    }

    private List<Event> parseTicketmasterResponse(String jsonResponse) {
        List<Event> events = new ArrayList<>();

        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode eventsNode = root.path("_embedded").path("events");

            if (eventsNode.isArray()) {
                for (JsonNode eventNode : eventsNode) {
                    Event event = parseTicketmasterEvent(eventNode);
                    if (event != null) {
                        events.add(event);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse Ticketmaster response: {}", e.getMessage());
        }

        return events;
    }

    private Event parseTicketmasterEvent(JsonNode eventNode) {
        try {
            String title = eventNode.path("name").asText();
            if (title.isBlank()) return null;

            String description = eventNode.path("description").asText("No description available");
            String venue = eventNode.path("_embedded").path("venues").get(0).path("name").asText("Unknown Venue");
            String city = eventNode.path("_embedded").path("venues").get(0).path("city").path("name").asText("Paris");

            LocalDateTime eventDate = parseTicketmasterDate(eventNode);
            if (eventDate == null) return null;

            EventCategory category = extractCategory(eventNode);
            List<String> tags = extractTags(eventNode);

            return Event.builder()
                    .title(title)
                    .description(description)
                    .category(category)
                    .date(eventDate)
                    .venue(venue)
                    .city(city)
                    .tags(tags)
                    .source("ticketmaster")
                    .build();
        } catch (Exception e) {
            log.debug("Failed to parse individual Ticketmaster event: {}", e.getMessage());
            return null;
        }
    }

    private LocalDateTime parseTicketmasterDate(JsonNode eventNode) {
        try {
            String dateStr = eventNode.path("dates").path("start").path("dateTime").asText();
            if (dateStr.isBlank()) {
                dateStr = eventNode.path("dates").path("start").path("localDate").asText();
                if (dateStr.isBlank()) return null;
                return LocalDateTime.parse(dateStr + "T20:00:00");
            }
            ZonedDateTime zdt = ZonedDateTime.parse(dateStr, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            return zdt.toLocalDateTime();
        } catch (Exception e) {
            log.debug("Failed to parse event date: {}", e.getMessage());
            return null;
        }
    }

    private EventCategory extractCategory(JsonNode eventNode) {
        try {
            JsonNode classificationNode = eventNode.path("classifications").get(0);
            if (classificationNode != null) {
                String genre = classificationNode.path("genre").path("name").asText().toLowerCase();
                String subGenre = classificationNode.path("subGenre").path("name").asText().toLowerCase();
                String type = classificationNode.path("type").path("name").asText().toLowerCase();

                if (genre.contains("music") || type.contains("concert")) return EventCategory.CONCERT;
                if (genre.contains("theatre") || type.contains("theatre")) return EventCategory.THEATRE;
                if (genre.contains("art") || type.contains("exhibition")) return EventCategory.EXHIBITION;
                if (genre.contains("film") || type.contains("film")) return EventCategory.CINEMA;
                if (genre.contains("festival")) return EventCategory.FESTIVAL;
            }
        } catch (Exception e) {
            log.debug("Failed to extract category: {}", e.getMessage());
        }

        return EventCategory.CONCERT;
    }

    private List<String> extractTags(JsonNode eventNode) {
        List<String> tags = new ArrayList<>();

        try {
            JsonNode classificationNode = eventNode.path("classifications").get(0);
            if (classificationNode != null) {
                String genre = classificationNode.path("genre").path("name").asText();
                String subGenre = classificationNode.path("subGenre").path("name").asText();

                if (!genre.isBlank()) tags.add(genre.toLowerCase().replace(" ", "-"));
                if (!subGenre.isBlank()) tags.add(subGenre.toLowerCase().replace(" ", "-"));
            }
        } catch (Exception e) {
            log.debug("Failed to extract tags: {}", e.getMessage());
        }

        if (tags.isEmpty()) {
            tags.add("ticketmaster");
        }

        return tags;
    }
}
