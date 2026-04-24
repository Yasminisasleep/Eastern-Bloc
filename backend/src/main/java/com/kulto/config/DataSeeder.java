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

    private static final String CITY_PARIS = "Paris";

    private final TicketmasterService ticketmasterService;

    @Bean
    CommandLineRunner seedEvents(EventRepository eventRepository) {
        return args -> {
            if (eventRepository.count() > 0) {
                log.info("Database already seeded, skipping DataSeeder");
                return;
            }

            List<Event> ticketmasterEvents = ticketmasterService.fetchEventsFromTicketmaster(50);
            List<Event> seedEvents = getFallbackEvents();

            List<Event> combined = new java.util.ArrayList<>();
            combined.addAll(ticketmasterEvents);
            combined.addAll(seedEvents);

            log.info("Seeding {} events ({} from Ticketmaster, {} curated)",
                    combined.size(), ticketmasterEvents.size(), seedEvents.size());
            eventRepository.saveAll(combined);
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
                        .city(CITY_PARIS)
                        .tags(List.of("sci-fi", "blockbuster"))
                        .imageUrl("https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&q=80&auto=format&fit=crop")
                        .source("seed")
                        .build(),
                Event.builder()
                        .title("Massive Attack")
                        .description("Mezzanine XXI tour")
                        .category(EventCategory.CONCERT)
                        .date(LocalDateTime.of(2026, 5, 10, 21, 0))
                        .venue("Accor Arena")
                        .city(CITY_PARIS)
                        .tags(List.of("trip-hop", "electronic"))
                        .imageUrl("https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80&auto=format&fit=crop")
                        .source("seed")
                        .build(),
                Event.builder()
                        .title("Basquiat x Warhol")
                        .description("Four hands exhibition")
                        .category(EventCategory.EXHIBITION)
                        .date(LocalDateTime.of(2026, 4, 1, 10, 0))
                        .venue("Fondation Louis Vuitton")
                        .city(CITY_PARIS)
                        .tags(List.of("contemporary-art", "painting"))
                        .imageUrl("https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=1200&q=80&auto=format&fit=crop")
                        .source("seed")
                        .build(),
                Event.builder()
                        .title("Romeo et Juliette")
                        .description("Shakespeare adapted by Olivier Py")
                        .category(EventCategory.THEATRE)
                        .date(LocalDateTime.of(2026, 4, 20, 19, 30))
                        .venue("Theatre de la Ville")
                        .city(CITY_PARIS)
                        .tags(List.of("classic", "drama"))
                        .imageUrl("https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=80&auto=format&fit=crop")
                        .source("seed")
                        .build(),
                Event.builder()
                        .title("We Love Green 2026")
                        .description("Eco-friendly music festival")
                        .category(EventCategory.FESTIVAL)
                        .date(LocalDateTime.of(2026, 6, 5, 14, 0))
                        .venue("Bois de Vincennes")
                        .city(CITY_PARIS)
                        .tags(List.of("festival", "electronic", "indie"))
                        .imageUrl("https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80&auto=format&fit=crop")
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
                        .imageUrl("https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80&auto=format&fit=crop")
                        .source("seed")
                        .build()
        );
    }
}
