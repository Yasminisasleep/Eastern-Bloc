package com.kulto.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "preferences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Preference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ElementCollection
    @CollectionTable(name = "preference_categories", joinColumns = @JoinColumn(name = "preference_id"))
    @Column(name = "category")
    @Enumerated(EnumType.STRING)
    private List<EventCategory> preferredCategories;

    @ElementCollection
    @CollectionTable(name = "preference_tags", joinColumns = @JoinColumn(name = "preference_id"))
    @Column(name = "tag")
    private List<String> interestTags;

    @Column(nullable = false)
    @Builder.Default
    private Integer geographicRadiusKm = 50;

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
