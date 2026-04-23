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

        java.util.LinkedHashMap<String, Event> byTitle = new java.util.LinkedHashMap<>();
        List<String> queries = List.of(
                "city=Paris&countryCode=FR",
                "countryCode=FR&sort=date,asc",
                "countryCode=FR&classificationName=music",
                "countryCode=FR&classificationName=arts",
                "countryCode=FR&classificationName=film"
        );

        for (String q : queries) {
            try {
                String url = String.format(
                        "https://app.ticketmaster.com/discovery/v2/events.json?%s&size=%d&apikey=%s",
                        q, Math.min(pageSize, 50), apiKey);
                WebClient webClient = webClientBuilder.build();
                String response = webClient.get()
                        .uri(url)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();

                for (Event e : parseTicketmasterResponse(response)) {
                    String key = (e.getTitle() + "|" + e.getVenue() + "|" + e.getDate()).toLowerCase();
                    byTitle.putIfAbsent(key, e);
                }
            } catch (Exception e) {
                log.warn("Ticketmaster query '{}' failed: {}", q, e.getMessage());
            }
        }

        List<Event> events = new ArrayList<>(byTitle.values());
        log.info("Ticketmaster returned {} unique events after deduplication", events.size());
        return events;
    }

    public List<Event> parseTicketmasterResponse(String jsonResponse) {
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

            String description = eventNode.path("info").asText(
                    eventNode.path("pleaseNote").asText(
                            eventNode.path("description").asText("No description available")));

            String venue = "Unknown Venue";
            String city = "Paris";
            JsonNode venuesNode = eventNode.path("_embedded").path("venues");
            if (venuesNode.isArray() && venuesNode.size() > 0) {
                JsonNode v = venuesNode.get(0);
                venue = cleanText(v.path("name").asText("Unknown Venue"));
                String cityName = cleanText(v.path("city").path("name").asText());
                if (!cityName.isBlank()) city = cityName;
            }

            LocalDateTime eventDate = parseTicketmasterDate(eventNode);
            if (eventDate == null) {
                eventDate = LocalDateTime.now().plusDays(30);
            }

            EventCategory category = extractCategory(eventNode);
            List<String> tags = extractTags(eventNode);

            String imageUrl = extractImageUrl(eventNode);
            String externalLink = eventNode.path("url").asText(null);

            return Event.builder()
                    .title(title)
                    .description(description.isBlank() ? "No description available" : description)
                    .category(category)
                    .date(eventDate)
                    .venue(venue)
                    .city(city)
                    .tags(tags)
                    .imageUrl(imageUrl)
                    .externalLink(externalLink)
                    .source("ticketmaster")
                    .build();
        } catch (Exception e) {
            log.warn("Failed to parse individual Ticketmaster event '{}': {}",
                    eventNode.path("name").asText("unknown"), e.getMessage());
            return null;
        }
    }

    private String cleanText(String text) {
        if (text == null) return "";
        return text
                .replace("D??fense", "Défense")
                .replace("D?? f", "Déf")
                .replace("d??fense", "défense")
                .trim();
    }

    private String extractImageUrl(JsonNode eventNode) {
        try {
            JsonNode images = eventNode.path("images");
            if (images.isArray() && images.size() > 0) {
                for (JsonNode img : images) {
                    String ratio = img.path("ratio").asText();
                    if ("16_9".equals(ratio)) {
                        return img.path("url").asText(null);
                    }
                }
                return images.get(0).path("url").asText(null);
            }
        } catch (Exception e) {
            log.debug("Failed to extract image: {}", e.getMessage());
        }
        return null;
    }

    private LocalDateTime parseTicketmasterDate(JsonNode eventNode) {
        try {
            String dateStr = eventNode.path("dates").path("start").path("dateTime").asText();
            if (!dateStr.isBlank()) {
                ZonedDateTime zdt = ZonedDateTime.parse(dateStr, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
                return zdt.toLocalDateTime();
            }
            String localDate = eventNode.path("dates").path("start").path("localDate").asText();
            String localTime = eventNode.path("dates").path("start").path("localTime").asText();
            if (!localDate.isBlank()) {
                String timeStr = !localTime.isBlank() ? localTime : "20:00:00";
                return LocalDateTime.parse(localDate + "T" + timeStr);
            }
        } catch (Exception e) {
            log.debug("Failed to parse event date: {}", e.getMessage());
        }
        return null;
    }

    private EventCategory extractCategory(JsonNode eventNode) {
        try {
            JsonNode classificationNode = eventNode.path("classifications").get(0);
            if (classificationNode != null && !classificationNode.isMissingNode()) {
                String segment = classificationNode.path("segment").path("name").asText("").toLowerCase();
                String genre = classificationNode.path("genre").path("name").asText("").toLowerCase();
                String subGenre = classificationNode.path("subGenre").path("name").asText("").toLowerCase();
                String type = classificationNode.path("type").path("name").asText("").toLowerCase();

                String all = segment + " " + genre + " " + subGenre + " " + type;

                if (all.contains("film") || all.contains("cinema") || all.contains("movie")) return EventCategory.CINEMA;
                if (all.contains("theatre") || all.contains("theater") || all.contains("musical") || all.contains("opera")) return EventCategory.THEATRE;
                if (all.contains("art") || all.contains("exhibition") || all.contains("museum")) return EventCategory.EXHIBITION;
                if (all.contains("festival")) return EventCategory.FESTIVAL;
                if (all.contains("music") || all.contains("concert") || all.contains("rock") || all.contains("pop") || all.contains("jazz") || all.contains("hip-hop") || all.contains("rap") || all.contains("electronic")) return EventCategory.CONCERT;
            }
        } catch (Exception e) {
            log.debug("Failed to extract category: {}", e.getMessage());
        }
        return EventCategory.CONCERT;
    }

    private List<String> extractTags(JsonNode eventNode) {
        java.util.LinkedHashSet<String> tagSet = new java.util.LinkedHashSet<>();

        try {
            JsonNode classificationNode = eventNode.path("classifications").get(0);
            if (classificationNode != null && !classificationNode.isMissingNode()) {
                String genre = classificationNode.path("genre").path("name").asText("");
                String subGenre = classificationNode.path("subGenre").path("name").asText("");
                String segment = classificationNode.path("segment").path("name").asText("");

                if (!genre.isBlank() && !"Undefined".equalsIgnoreCase(genre)) {
                    tagSet.add(genre.toLowerCase().replace(" ", "-"));
                }
                if (!subGenre.isBlank() && !"Undefined".equalsIgnoreCase(subGenre) && !subGenre.equalsIgnoreCase(genre)) {
                    tagSet.add(subGenre.toLowerCase().replace(" ", "-"));
                }
                if (!segment.isBlank() && !"Undefined".equalsIgnoreCase(segment) && tagSet.isEmpty()) {
                    tagSet.add(segment.toLowerCase().replace(" ", "-"));
                }
            }
        } catch (Exception e) {
            log.debug("Failed to extract tags: {}", e.getMessage());
        }

        if (tagSet.isEmpty()) {
            tagSet.add("event");
        }

        return new ArrayList<>(tagSet);
    }
}
