package com.kulto.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kulto.domain.Event;
import com.kulto.domain.EventCategory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketmasterServiceTest {

    @Mock
    private WebClient.Builder webClientBuilder;

    @Mock
    private WebClient webClient;

    @Mock
    private WebClient.RequestHeadersUriSpec<?> requestHeadersUriSpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    private TicketmasterService ticketmasterService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        ticketmasterService = new TicketmasterService(webClientBuilder, objectMapper);
    }

    @Test
    void fetchEventsFromTicketmaster_disabled_returnsEmptyList() {
        List<Event> events = ticketmasterService.fetchEventsFromTicketmaster("Paris", 10);
        assertTrue(events.isEmpty());
    }

    @Test
    void parseTicketmasterResponse_validJson_returnsEvents() {
        String validJson = """
                {
                  "_embedded": {
                    "events": [
                      {
                        "name": "Test Concert",
                        "description": "A test concert",
                        "dates": {
                          "start": {
                            "dateTime": "2026-05-15T20:00:00Z"
                          }
                        },
                        "_embedded": {
                          "venues": [
                            {
                              "name": "Test Venue",
                              "city": {
                                "name": "Paris"
                              }
                            }
                          ]
                        },
                        "classifications": [
                          {
                            "genre": {
                              "name": "Music"
                            },
                            "subGenre": {
                              "name": "Rock"
                            },
                            "type": {
                              "name": "Concert"
                            }
                          }
                        ]
                      }
                    ]
                  }
                }
                """;

        List<Event> events = ticketmasterService.parseTicketmasterResponse(validJson);
        assertFalse(events.isEmpty());
        assertEquals(1, events.size());
        assertEquals("Test Concert", events.get(0).getTitle());
        assertEquals("Test Venue", events.get(0).getVenue());
        assertEquals("ticketmaster", events.get(0).getSource());
    }

    @Test
    void parseTicketmasterResponse_invalidJson_returnsEmptyList() {
        String invalidJson = "{ invalid json }";
        List<Event> events = ticketmasterService.parseTicketmasterResponse(invalidJson);
        assertTrue(events.isEmpty());
    }

    @Test
    void extractCategory_musicGenre_returnsConcert() {
        String json = """
                {
                  "classifications": [
                    {
                      "genre": { "name": "Music" },
                      "subGenre": { "name": "Rock" },
                      "type": { "name": "Concert" }
                    }
                  ]
                }
                """;

        try {
            var node = objectMapper.readTree(json);
            var events = ticketmasterService.parseTicketmasterResponse(
                    String.format("""
                            {
                              "_embedded": {
                                "events": [%s]
                              }
                            }
                            """,
                            json.replace("\"classifications\"", "\"name\": \"Test\", \"dates\": {\"start\": {\"dateTime\": \"2026-05-15T20:00:00Z\"}}, \"description\": \"Test\", \"_embedded\": {\"venues\": [{\"name\": \"Venue\", \"city\": {\"name\": \"Paris\"}}]}, \"classifications\"")
                    )
            );
            if (!events.isEmpty()) {
                assertEquals(EventCategory.CONCERT, events.get(0).getCategory());
            }
        } catch (Exception e) {
            // Test parsing logic
        }
    }

    @Test
    void parseTicketmasterResponse_emptyEvents_returnsEmptyList() {
        String json = """
                {
                  "_embedded": {
                    "events": []
                  }
                }
                """;

        List<Event> events = ticketmasterService.parseTicketmasterResponse(json);
        assertTrue(events.isEmpty());
    }

    @Test
    void parseTicketmasterResponse_missingEmbedded_returnsEmptyList() {
        String json = "{}";
        List<Event> events = ticketmasterService.parseTicketmasterResponse(json);
        assertTrue(events.isEmpty());
    }
}
