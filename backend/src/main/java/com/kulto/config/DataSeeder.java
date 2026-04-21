package com.kulto.config;

import com.kulto.domain.Event;
import com.kulto.domain.EventCategory;
import com.kulto.repository.EventRepository;
import com.kulto.service.TicketmasterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final TicketmasterService ticketmasterService;

    @Bean
    CommandLineRunner seedEvents(EventRepository eventRepository) {
        return args -> {
            if (eventRepository.count() > 0) {
                log.info("Database already seeded, skipping DataSeeder");
                return;
            }

            List<Event> ticketmasterEvents = ticketmasterService.fetchEventsFromTicketmaster("Paris", 20);

            if (!ticketmasterEvents.isEmpty()) {
                log.info("Seeding {} events from Ticketmaster", ticketmasterEvents.size());
                eventRepository.saveAll(ticketmasterEvents);
            } else {
                log.info("No Ticketmaster events found, using fallback seed data");
                eventRepository.saveAll(getFallbackEvents());
            }
        };
    }

    private List<Event> getFallbackEvents() {
        return List.of(
                Event.builder()
                        .title("Dune Part Three")
                        .description("Denis Villeneuve concludes the saga")
                        .category(EventCategory.CINEMA)
                        .date(LocalDateTime.of(2026, 4, 15, 20, 0))
                        .venue("MK2 Bibliotheque")
                        .city("Paris")
                        .tags(List.of("sci-fi", "blockbuster"))
                        .source("seed")
                        .build(),
                Event.builder()
                        .title("Massive Attack")
                        .description("Mezzanine XXI tour")
                        .category(EventCategory.CONCERT)
                        .date(LocalDateTime.of(2026, 5, 10, 21, 0))
                        .venue("Accor Arena")
                        .city("Paris")
                        .tags(List.of("trip-hop", "electronic"))
                        .source("seed")
                        .build(),
                Event.builder()
                        .title("Basquiat x Warhol")
                        .description("Four hands exhibition")
                        .category(EventCategory.EXHIBITION)
                        .date(LocalDateTime.of(2026, 4, 1, 10, 0))
                        .venue("Fondation Louis Vuitton")
                        .city("Paris")
                        .tags(List.of("contemporary-art", "painting"))
                        .source("seed")
                        .build(),
                Event.builder()
                        .title("Romeo et Juliette")
                        .description("Shakespeare adapted by Olivier Py")
                        .category(EventCategory.THEATRE)
                        .date(LocalDateTime.of(2026, 4, 20, 19, 30))
                        .venue("Theatre de la Ville")
                        .city("Paris")
                        .tags(List.of("classic", "drama"))
                        .source("seed")
                        .build(),
                Event.builder()
                        .title("We Love Green 2026")
                        .description("Eco-friendly music festival")
                        .category(EventCategory.FESTIVAL)
                        .date(LocalDateTime.of(2026, 6, 5, 14, 0))
                        .venue("Bois de Vincennes")
                        .city("Paris")
                        .tags(List.of("festival", "electronic", "indie"))
                        .source("seed")
                        .build(),
                Event.builder()
                        .title("Kendrick Lamar")
                        .description("The Grand National Tour")
                        .category(EventCategory.CONCERT)
                        .date(LocalDateTime.of(2026, 7, 12, 20, 30))
                        .venue("Stade de France")
                        .city("Saint-Denis")
                        .tags(List.of("hip-hop", "rap"))
                        .source("seed")
                        .build()
        );
    }
}
