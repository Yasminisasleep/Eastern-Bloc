package com.kulto.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "matches")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user2_id", nullable = false)
    private User user2;

    /** null = not yet responded */
    private Boolean user1Accepted;

    /** null = not yet responded */
    private Boolean user2Accepted;

    @Column(nullable = false)
    private Double compatibilityScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MatchStatus status = MatchStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
