package com.kulto.dto;

import com.kulto.domain.EventInterest;
import com.kulto.domain.Event;
import com.kulto.domain.EventCategory;
import com.kulto.domain.Gender;
import com.kulto.domain.User;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class DomainAndDtoSmokeTest {

    @Test
    void genderEnum_hasAllExpectedValues() {
        assertEquals(4, Gender.values().length);
        assertEquals(Gender.MALE, Gender.valueOf("MALE"));
        assertEquals(Gender.FEMALE, Gender.valueOf("FEMALE"));
        assertEquals(Gender.OTHER, Gender.valueOf("OTHER"));
        assertEquals(Gender.PREFER_NOT_TO_SAY, Gender.valueOf("PREFER_NOT_TO_SAY"));
    }

    @Test
    void preferenceRequest_builderAndSetters_work() {
        PreferenceRequest r = PreferenceRequest.builder()
                .preferredCategories(List.of("CINEMA"))
                .interestTags(List.of("sci-fi"))
                .geographicRadiusKm(20)
                .age(30)
                .gender("FEMALE")
                .preferredGenders(List.of("MALE"))
                .preferredAgeMin(25)
                .preferredAgeMax(40)
                .build();

        assertEquals(30, r.getAge());
        assertEquals("FEMALE", r.getGender());
        assertEquals(List.of("MALE"), r.getPreferredGenders());
        assertEquals(25, r.getPreferredAgeMin());
        assertEquals(40, r.getPreferredAgeMax());

        PreferenceRequest def = new PreferenceRequest();
        def.setAge(22);
        def.setGender("MALE");
        assertEquals(22, def.getAge());
        assertEquals("MALE", def.getGender());
    }

    @Test
    void preferenceResponse_builder_populatesAllFields() {
        PreferenceResponse r = PreferenceResponse.builder()
                .preferredCategories(List.of("CINEMA"))
                .interestTags(List.of("tag"))
                .geographicRadiusKm(10)
                .age(28)
                .gender("MALE")
                .preferredGenders(List.of("FEMALE"))
                .preferredAgeMin(20)
                .preferredAgeMax(35)
                .updatedAt("2026-01-01T00:00:00")
                .build();

        assertEquals(28, r.getAge());
        assertEquals("MALE", r.getGender());
        assertEquals(List.of("FEMALE"), r.getPreferredGenders());
        assertEquals(20, r.getPreferredAgeMin());
        assertEquals(35, r.getPreferredAgeMax());
        assertEquals("2026-01-01T00:00:00", r.getUpdatedAt());
    }

    @Test
    void eventInterest_builder_setsFields() {
        User u = User.builder().id(1L).email("a@b.c").displayName("A").passwordHash("h").build();
        Event e = Event.builder().id(1L).title("T").category(EventCategory.CINEMA)
                .date(LocalDateTime.now()).source("s").build();
        LocalDateTime now = LocalDateTime.now();

        EventInterest ei = EventInterest.builder()
                .id(9L).user(u).event(e).createdAt(now).build();

        assertEquals(9L, ei.getId());
        assertEquals(u, ei.getUser());
        assertEquals(e, ei.getEvent());
        assertEquals(now, ei.getCreatedAt());

        EventInterest ei2 = new EventInterest();
        ei2.setUser(u);
        ei2.setEvent(e);
        assertEquals(u, ei2.getUser());
        assertEquals(e, ei2.getEvent());
    }

    @Test
    void user_demographicAccessors_work() {
        User u = User.builder()
                .email("x@y.z").displayName("X").passwordHash("h")
                .age(27).gender(Gender.OTHER).build();

        assertEquals(27, u.getAge());
        assertEquals(Gender.OTHER, u.getGender());

        u.setAge(28);
        u.setGender(Gender.FEMALE);
        assertEquals(28, u.getAge());
        assertEquals(Gender.FEMALE, u.getGender());
    }

    @Test
    void contactLinkRequest_accessors_work() {
        ContactLinkRequest r = new ContactLinkRequest();
        assertNull(r.getContactLink());
        r.setContactLink("@handle");
        assertEquals("@handle", r.getContactLink());
    }
}
