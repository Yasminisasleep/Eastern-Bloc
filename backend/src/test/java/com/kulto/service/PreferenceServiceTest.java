package com.kulto.service;

import com.kulto.domain.EventCategory;
import com.kulto.domain.Preference;
import com.kulto.domain.User;
import com.kulto.dto.PreferenceRequest;
import com.kulto.dto.PreferenceResponse;
import com.kulto.exception.ResourceNotFoundException;
import com.kulto.repository.PreferenceRepository;
import com.kulto.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PreferenceServiceTest {

    @Mock
    private PreferenceRepository preferenceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    private PreferenceService preferenceService;

    private User testUser;

    @BeforeEach
    void setUp() {
        preferenceService = new PreferenceService(preferenceRepository, userRepository, kafkaTemplate);
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .displayName("Test User")
                .passwordHash("hash")
                .build();
    }

    @Test
    void getPreferences_existingUser_returnsResponse() {
        Preference pref = Preference.builder()
                .id(1L)
                .user(testUser)
                .preferredCategories(List.of(EventCategory.CINEMA, EventCategory.CONCERT))
                .interestTags(List.of("sci-fi", "rock"))
                .geographicRadiusKm(30)
                .updatedAt(LocalDateTime.now())
                .build();

        when(preferenceRepository.findByUserId(1L)).thenReturn(Optional.of(pref));

        PreferenceResponse response = preferenceService.getPreferences(1L);

        assertNotNull(response);
        assertEquals(2, response.getPreferredCategories().size());
        assertTrue(response.getPreferredCategories().contains("CINEMA"));
        assertEquals(2, response.getInterestTags().size());
        assertEquals(30, response.getGeographicRadiusKm());
    }

    @Test
    void getPreferences_nonExistentUser_throwsException() {
        when(preferenceRepository.findByUserId(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> preferenceService.getPreferences(99L));
    }

    @Test
    void savePreferences_newPreferences_createsAndPublishesKafka() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(preferenceRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(preferenceRepository.save(any(Preference.class))).thenAnswer(inv -> inv.getArgument(0));

        PreferenceRequest request = new PreferenceRequest();
        request.setPreferredCategories(List.of("CINEMA", "CONCERT"));
        request.setInterestTags(List.of("sci-fi", "live"));
        request.setGeographicRadiusKm(25);

        PreferenceResponse response = preferenceService.savePreferences(1L, request);

        assertNotNull(response);
        assertEquals(List.of("CINEMA", "CONCERT"), response.getPreferredCategories());
        assertEquals(List.of("sci-fi", "live"), response.getInterestTags());
        assertEquals(25, response.getGeographicRadiusKm());

        verify(preferenceRepository).save(any(Preference.class));
        verify(kafkaTemplate).send(eq("user.preferences.updated"), contains("1"));
    }

    @Test
    void savePreferences_existingPreferences_updatesAndPublishesKafka() {
        Preference existing = Preference.builder()
                .id(1L)
                .user(testUser)
                .preferredCategories(List.of(EventCategory.CINEMA))
                .interestTags(List.of("old-tag"))
                .geographicRadiusKm(10)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(preferenceRepository.findByUserId(1L)).thenReturn(Optional.of(existing));
        when(preferenceRepository.save(any(Preference.class))).thenAnswer(inv -> inv.getArgument(0));

        PreferenceRequest request = new PreferenceRequest();
        request.setPreferredCategories(List.of("EXHIBITION"));
        request.setInterestTags(List.of("art", "photography"));
        request.setGeographicRadiusKm(50);

        PreferenceResponse response = preferenceService.savePreferences(1L, request);

        assertEquals(List.of("EXHIBITION"), response.getPreferredCategories());
        assertEquals(List.of("art", "photography"), response.getInterestTags());
        assertEquals(50, response.getGeographicRadiusKm());
    }

    @Test
    void savePreferences_nonExistentUser_throwsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        PreferenceRequest request = new PreferenceRequest();
        request.setPreferredCategories(List.of("CINEMA"));
        request.setInterestTags(List.of("tag"));
        request.setGeographicRadiusKm(10);

        assertThrows(ResourceNotFoundException.class, () -> preferenceService.savePreferences(99L, request));
    }

    @Test
    void savePreferences_kafkaFailure_doesNotThrow() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(preferenceRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(preferenceRepository.save(any(Preference.class))).thenAnswer(inv -> inv.getArgument(0));
        when(kafkaTemplate.send(anyString(), anyString())).thenThrow(new RuntimeException("Kafka down"));

        PreferenceRequest request = new PreferenceRequest();
        request.setPreferredCategories(List.of("CINEMA"));
        request.setInterestTags(List.of("tag"));
        request.setGeographicRadiusKm(10);

        assertDoesNotThrow(() -> preferenceService.savePreferences(1L, request));
    }
}
