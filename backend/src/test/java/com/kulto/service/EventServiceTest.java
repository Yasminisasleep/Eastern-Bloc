package com.kulto.service;

import com.kulto.domain.Event;
import com.kulto.domain.EventCategory;
import com.kulto.domain.EventStatus;
import com.kulto.dto.EventRequest;
import com.kulto.exception.ResourceNotFoundException;
import com.kulto.repository.EventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class EventServiceTest {

    @Autowired
    private EventRepository eventRepository;

    private EventService eventService;

    @BeforeEach
    void setUp() {
        eventService = new EventService(eventRepository);
        eventRepository.deleteAll();
    }

    @Test
    void createEvent_withValidData_returnsEvent() {
        EventRequest request = new EventRequest();
        request.setTitle("Concert Test");
        request.setDescription("A test concert");
        request.setCategory(EventCategory.CONCERT);
        request.setDate(LocalDateTime.now().plusDays(30));
        request.setVenue("Test Venue");
        request.setCity("Paris");
        request.setTags(List.of("rock", "live"));

        Event event = eventService.createEvent(request);

        assertNotNull(event);
        assertEquals("Concert Test", event.getTitle());
        assertEquals(EventCategory.CONCERT, event.getCategory());
        assertEquals(EventStatus.ACTIVE, event.getStatus());
    }

    @Test
    void createEvent_withPastDate_throwsException() {
        EventRequest request = new EventRequest();
        request.setTitle("Past Event");
        request.setCategory(EventCategory.CINEMA);
        request.setDate(LocalDateTime.now().minusDays(1));
        request.setVenue("Venue");
        request.setCity("Paris");

        assertThrows(IllegalArgumentException.class, () -> eventService.createEvent(request));
    }

    @Test
    void getEventById_existingEvent_returnsEvent() {
        Event event = createSampleEvent("Find Me", EventCategory.EXHIBITION);

        Event retrieved = eventService.getEventById(event.getId());

        assertNotNull(retrieved);
        assertEquals("Find Me", retrieved.getTitle());
        assertEquals(event.getId(), retrieved.getId());
    }

    @Test
    void getEventById_nonExistentEvent_throwsException() {
        assertThrows(ResourceNotFoundException.class, () -> eventService.getEventById(999L));
    }

    @Test
    void updateEvent_withValidData_returnsUpdatedEvent() {
        Event event = createSampleEvent("Original", EventCategory.THEATRE);

        EventRequest update = new EventRequest();
        update.setTitle("Updated");
        update.setDescription("Updated description");
        update.setCategory(EventCategory.THEATRE);
        update.setDate(LocalDateTime.now().plusDays(60));
        update.setVenue("New Venue");
        update.setCity("Lyon");
        update.setTags(List.of("theatre"));

        Event updated = eventService.updateEvent(event.getId(), update);

        assertEquals("Updated", updated.getTitle());
        assertEquals("Updated description", updated.getDescription());
        assertEquals("Lyon", updated.getCity());
    }

    @Test
    void updateEvent_nonExistentEvent_throwsException() {
        EventRequest update = new EventRequest();
        update.setTitle("Updated");
        update.setCategory(EventCategory.CONCERT);
        update.setDate(LocalDateTime.now().plusDays(30));
        update.setVenue("Venue");
        update.setCity("Paris");

        assertThrows(ResourceNotFoundException.class, () -> eventService.updateEvent(999L, update));
    }

    @Test
    void deleteEvent_existingEvent_softDeletes() {
        Event event = createSampleEvent("To Delete", EventCategory.FESTIVAL);

        eventService.deleteEvent(event.getId());

        Event deleted = eventRepository.findById(event.getId()).orElse(null);
        assertNotNull(deleted);
        assertEquals(EventStatus.DELETED, deleted.getStatus());
    }

    @Test
    void deleteEvent_nonExistentEvent_throwsException() {
        assertThrows(ResourceNotFoundException.class, () -> eventService.deleteEvent(999L));
    }

    @Test
    void listEvents_returnsPage() {
        createSampleEvent("Event 1", EventCategory.CINEMA);
        createSampleEvent("Event 2", EventCategory.CONCERT);
        createSampleEvent("Event 3", EventCategory.EXHIBITION);

        Page<Event> page = eventService.listEvents(null, null, PageRequest.of(0, 10));

        assertEquals(3, page.getContent().size());
        assertEquals(1, page.getTotalPages());
    }

    @Test
    void listEvents_filterByCategory_returnsFiltered() {
        createSampleEvent("Cinema Event", EventCategory.CINEMA);
        createSampleEvent("Concert Event", EventCategory.CONCERT);
        createSampleEvent("Cinema 2", EventCategory.CINEMA);

        Page<Event> page = eventService.listEvents(EventCategory.CINEMA, null, PageRequest.of(0, 10));

        assertEquals(2, page.getContent().size());
        assertTrue(page.getContent().stream().allMatch(e -> e.getCategory() == EventCategory.CINEMA));
    }

    @Test
    void listEvents_filterByCity_returnsFiltered() {
        createSampleEvent("Paris Event", EventCategory.CINEMA);
        createSampleEvent("Lyon Event", EventCategory.CONCERT);

        Page<Event> page = eventService.listEvents(null, "Paris", PageRequest.of(0, 10));

        assertEquals(1, page.getContent().size());
        assertEquals("Paris", page.getContent().get(0).getCity());
    }

    private Event createSampleEvent(String title, EventCategory category) {
        Event event = Event.builder()
                .title(title)
                .description("test")
                .category(category)
                .date(LocalDateTime.now().plusDays(30))
                .venue("Venue")
                .city("Paris")
                .tags(List.of("test"))
                .source("test")
                .status(EventStatus.ACTIVE)
                .build();
        return eventRepository.save(event);
    }
}
