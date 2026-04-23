package com.kulto.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kulto.domain.Event;
import com.kulto.domain.EventCategory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketmasterServiceTest {

    @Mock
    private WebClient.Builder webClientBuilder;

    private TicketmasterService ticketmasterService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        ticketmasterService = new TicketmasterService(webClientBuilder, objectMapper);
    }

    // ---------- fetchEventsFromTicketmaster ----------

    @Test
    void fetchEvents_disabled_returnsEmpty() {
        assertTrue(ticketmasterService.fetchEventsFromTicketmaster("Paris", 10).isEmpty());
    }

    @Test
    void fetchEvents_enabledButBlankKey_returnsEmpty() {
        ReflectionTestUtils.setField(ticketmasterService, "enabled", true);
        ReflectionTestUtils.setField(ticketmasterService, "apiKey", "   ");
        assertTrue(ticketmasterService.fetchEventsFromTicketmaster("Paris", 10).isEmpty());
    }

    @Test
    void fetchEvents_enabledWithKey_webClientError_returnsEmpty() {
        ReflectionTestUtils.setField(ticketmasterService, "enabled", true);
        ReflectionTestUtils.setField(ticketmasterService, "apiKey", "fake-key");
        when(webClientBuilder.build()).thenThrow(new RuntimeException("boom"));
        List<Event> events = ticketmasterService.fetchEventsFromTicketmaster("Paris", 5);
        assertTrue(events.isEmpty());
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    @Test
    void fetchEvents_happyPath_returnsDeduplicatedEvents() {
        ReflectionTestUtils.setField(ticketmasterService, "enabled", true);
        ReflectionTestUtils.setField(ticketmasterService, "apiKey", "fake-key");

        String json = """
                {
                  "_embedded": {
                    "events": [
                      {
                        "name": "Shared Show",
                        "dates": {"start": {"dateTime": "2026-05-15T20:00:00Z"}},
                        "_embedded": {"venues": [{"name": "Venue A", "city": {"name": "Paris"}}]},
                        "classifications": [{"genre": {"name": "Music"}, "subGenre": {"name": "Rock"}}]
                      }
                    ]
                  }
                }
                """;

        WebClient webClient = mock(WebClient.class);
        WebClient.RequestHeadersUriSpec uriSpec = mock(WebClient.RequestHeadersUriSpec.class);
        WebClient.RequestHeadersSpec headersSpec = mock(WebClient.RequestHeadersSpec.class);
        WebClient.ResponseSpec responseSpec = mock(WebClient.ResponseSpec.class);

        when(webClientBuilder.build()).thenReturn(webClient);
        when(webClient.get()).thenReturn(uriSpec);
        when(uriSpec.uri(anyString())).thenReturn(headersSpec);
        when(headersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(json));

        List<Event> events = ticketmasterService.fetchEventsFromTicketmaster("Paris", 10);

        // Same event returned on all 5 queries → deduped to 1
        assertEquals(1, events.size());
        assertEquals("Shared Show", events.get(0).getTitle());
    }

    // ---------- parseTicketmasterResponse ----------

    @Test
    void parseResponse_blankName_skipsEvent() {
        String json = """
                {"_embedded": {"events": [
                  {"name": "", "dates": {"start": {"localDate": "2026-05-15"}}}
                ]}}
                """;
        assertTrue(ticketmasterService.parseTicketmasterResponse(json).isEmpty());
    }

    @Test
    void parseResponse_noVenues_usesDefaults() {
        String json = """
                {"_embedded": {"events": [
                  {"name": "No Venue Event",
                   "dates": {"start": {"dateTime": "2026-05-15T20:00:00Z"}}}
                ]}}
                """;
        List<Event> events = ticketmasterService.parseTicketmasterResponse(json);
        assertEquals(1, events.size());
        assertEquals("Unknown Venue", events.get(0).getVenue());
        assertEquals("Paris", events.get(0).getCity());
    }

    @Test
    void parseResponse_invalidDate_fallsBackToFuture() {
        String json = """
                {"_embedded": {"events": [
                  {"name": "Dateless"}
                ]}}
                """;
        List<Event> events = ticketmasterService.parseTicketmasterResponse(json);
        assertEquals(1, events.size());
        assertTrue(events.get(0).getDate().isAfter(LocalDateTime.now()));
    }

    @Test
    void parseResponse_localDateOnly_usesDefaultTime() {
        String json = """
                {"_embedded": {"events": [
                  {"name": "Local Date Event",
                   "dates": {"start": {"localDate": "2026-06-10"}}}
                ]}}
                """;
        List<Event> events = ticketmasterService.parseTicketmasterResponse(json);
        assertEquals(1, events.size());
        assertEquals(20, events.get(0).getDate().getHour());
    }

    @Test
    void parseResponse_localDateAndTime_usesProvided() {
        String json = """
                {"_embedded": {"events": [
                  {"name": "Date+Time Event",
                   "dates": {"start": {"localDate": "2026-06-10", "localTime": "14:30:00"}}}
                ]}}
                """;
        List<Event> events = ticketmasterService.parseTicketmasterResponse(json);
        assertEquals(14, events.get(0).getDate().getHour());
        assertEquals(30, events.get(0).getDate().getMinute());
    }

    @Test
    void parseResponse_usesInfoThenPleaseNoteThenDescription() {
        String json = """
                {"_embedded": {"events": [
                  {"name": "E1", "info": "from info",
                   "dates": {"start": {"localDate": "2026-06-10"}}}
                ]}}
                """;
        assertEquals("from info",
                ticketmasterService.parseTicketmasterResponse(json).get(0).getDescription());
    }

    @Test
    void parseResponse_emptyInfo_defaultsToNoDescription() {
        String json = """
                {"_embedded": {"events": [
                  {"name": "E1", "info": "",
                   "dates": {"start": {"localDate": "2026-06-10"}}}
                ]}}
                """;
        assertEquals("No description available",
                ticketmasterService.parseTicketmasterResponse(json).get(0).getDescription());
    }

    @Test
    void parseResponse_invalidJson_returnsEmpty() {
        assertTrue(ticketmasterService.parseTicketmasterResponse("{ not valid").isEmpty());
    }

    @Test
    void parseResponse_emptyEvents() {
        assertTrue(ticketmasterService.parseTicketmasterResponse(
                "{\"_embedded\": {\"events\": []}}").isEmpty());
    }

    @Test
    void parseResponse_missingEmbedded() {
        assertTrue(ticketmasterService.parseTicketmasterResponse("{}").isEmpty());
    }

    // ---------- Category extraction ----------

    private String eventWithClassification(String segment, String genre, String subGenre, String type) {
        return String.format("""
                {"_embedded": {"events": [
                  {"name": "E",
                   "dates": {"start": {"localDate": "2026-06-10"}},
                   "classifications": [{
                      "segment": {"name": "%s"},
                      "genre": {"name": "%s"},
                      "subGenre": {"name": "%s"},
                      "type": {"name": "%s"}
                   }]}
                ]}}
                """, segment, genre, subGenre, type);
    }

    @Test
    void category_film_returnsCinema() {
        Event e = ticketmasterService.parseTicketmasterResponse(
                eventWithClassification("Film", "Movies", "", "")).get(0);
        assertEquals(EventCategory.CINEMA, e.getCategory());
    }

    @Test
    void category_cinema_returnsCinema() {
        Event e = ticketmasterService.parseTicketmasterResponse(
                eventWithClassification("", "Cinema", "", "")).get(0);
        assertEquals(EventCategory.CINEMA, e.getCategory());
    }

    @Test
    void category_theatre_returnsTheatre() {
        Event e = ticketmasterService.parseTicketmasterResponse(
                eventWithClassification("", "Theatre", "", "")).get(0);
        assertEquals(EventCategory.THEATRE, e.getCategory());
    }

    @Test
    void category_opera_returnsTheatre() {
        Event e = ticketmasterService.parseTicketmasterResponse(
                eventWithClassification("", "", "Opera", "")).get(0);
        assertEquals(EventCategory.THEATRE, e.getCategory());
    }

    @Test
    void category_musical_returnsTheatre() {
        Event e = ticketmasterService.parseTicketmasterResponse(
                eventWithClassification("", "", "", "Musical")).get(0);
        assertEquals(EventCategory.THEATRE, e.getCategory());
    }

    @Test
    void category_art_returnsExhibition() {
        Event e = ticketmasterService.parseTicketmasterResponse(
                eventWithClassification("Visual", "Fine Art", "", "")).get(0);
        assertEquals(EventCategory.EXHIBITION, e.getCategory());
    }

    @Test
    void category_museum_returnsExhibition() {
        Event e = ticketmasterService.parseTicketmasterResponse(
                eventWithClassification("", "Museum", "", "")).get(0);
        assertEquals(EventCategory.EXHIBITION, e.getCategory());
    }

    @Test
    void category_festival_returnsFestival() {
        Event e = ticketmasterService.parseTicketmasterResponse(
                eventWithClassification("", "Festival", "", "")).get(0);
        assertEquals(EventCategory.FESTIVAL, e.getCategory());
    }

    @Test
    void category_jazz_returnsConcert() {
        Event e = ticketmasterService.parseTicketmasterResponse(
                eventWithClassification("", "Jazz", "", "")).get(0);
        assertEquals(EventCategory.CONCERT, e.getCategory());
    }

    @Test
    void category_hipHop_returnsConcert() {
        Event e = ticketmasterService.parseTicketmasterResponse(
                eventWithClassification("", "Hip-Hop", "", "")).get(0);
        assertEquals(EventCategory.CONCERT, e.getCategory());
    }

    @Test
    void category_electronic_returnsConcert() {
        Event e = ticketmasterService.parseTicketmasterResponse(
                eventWithClassification("", "Electronic", "", "")).get(0);
        assertEquals(EventCategory.CONCERT, e.getCategory());
    }

    @Test
    void category_noClassifications_defaultsToConcert() {
        String json = """
                {"_embedded": {"events": [
                  {"name": "E",
                   "dates": {"start": {"localDate": "2026-06-10"}}}
                ]}}
                """;
        assertEquals(EventCategory.CONCERT,
                ticketmasterService.parseTicketmasterResponse(json).get(0).getCategory());
    }

    // ---------- Image extraction ----------

    @Test
    void image_prefers16_9Ratio() {
        String json = """
                {"_embedded": {"events": [
                  {"name": "E",
                   "dates": {"start": {"localDate": "2026-06-10"}},
                   "images": [
                     {"ratio": "4_3", "url": "http://a.jpg"},
                     {"ratio": "16_9", "url": "http://b.jpg"}
                   ]}
                ]}}
                """;
        assertEquals("http://b.jpg",
                ticketmasterService.parseTicketmasterResponse(json).get(0).getImageUrl());
    }

    @Test
    void image_fallbackToFirst_when_no16_9() {
        String json = """
                {"_embedded": {"events": [
                  {"name": "E",
                   "dates": {"start": {"localDate": "2026-06-10"}},
                   "images": [
                     {"ratio": "4_3", "url": "http://first.jpg"},
                     {"ratio": "1_1", "url": "http://second.jpg"}
                   ]}
                ]}}
                """;
        assertEquals("http://first.jpg",
                ticketmasterService.parseTicketmasterResponse(json).get(0).getImageUrl());
    }

    @Test
    void image_noImages_returnsNull() {
        String json = """
                {"_embedded": {"events": [
                  {"name": "E",
                   "dates": {"start": {"localDate": "2026-06-10"}}}
                ]}}
                """;
        assertNull(ticketmasterService.parseTicketmasterResponse(json).get(0).getImageUrl());
    }

    // ---------- Tags extraction ----------

    @Test
    void tags_includeGenreAndSubGenre() {
        Event e = ticketmasterService.parseTicketmasterResponse(
                eventWithClassification("Music", "Rock", "Indie Rock", "")).get(0);
        assertTrue(e.getTags().contains("rock"));
        assertTrue(e.getTags().contains("indie-rock"));
    }

    @Test
    void tags_skipUndefinedGenre() {
        Event e = ticketmasterService.parseTicketmasterResponse(
                eventWithClassification("Music", "Undefined", "Undefined", "")).get(0);
        // Falls back to segment
        assertTrue(e.getTags().contains("music"));
    }

    @Test
    void tags_defaultsToEvent_whenAllEmpty() {
        String json = """
                {"_embedded": {"events": [
                  {"name": "E",
                   "dates": {"start": {"localDate": "2026-06-10"}}}
                ]}}
                """;
        assertEquals(List.of("event"),
                ticketmasterService.parseTicketmasterResponse(json).get(0).getTags());
    }

    @Test
    void tags_skipDuplicateSubGenre() {
        Event e = ticketmasterService.parseTicketmasterResponse(
                eventWithClassification("", "Rock", "rock", "")).get(0);
        assertEquals(1, e.getTags().stream().filter("rock"::equals).count());
    }

    // ---------- cleanText (via venue name) ----------

    @Test
    void cleanText_replacesBrokenEncoding() {
        String json = """
                {"_embedded": {"events": [
                  {"name": "E",
                   "dates": {"start": {"localDate": "2026-06-10"}},
                   "_embedded": {"venues": [{"name": "Paris D??fense Arena", "city": {"name": "Paris"}}]}}
                ]}}
                """;
        Event e = ticketmasterService.parseTicketmasterResponse(json).get(0);
        assertEquals("Paris Défense Arena", e.getVenue());
    }

    // ---------- externalLink + source ----------

    @Test
    void parseResponse_includesUrlAsExternalLink() {
        String json = """
                {"_embedded": {"events": [
                  {"name": "E",
                   "url": "https://ticketmaster.fr/event/123",
                   "dates": {"start": {"localDate": "2026-06-10"}}}
                ]}}
                """;
        Event e = ticketmasterService.parseTicketmasterResponse(json).get(0);
        assertEquals("https://ticketmaster.fr/event/123", e.getExternalLink());
        assertEquals("ticketmaster", e.getSource());
    }
}
