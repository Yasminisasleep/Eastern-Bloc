package com.kulto.repository;

import com.kulto.domain.Event;
import com.kulto.domain.Match;
import com.kulto.domain.MatchStatus;
import com.kulto.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MatchRepository extends JpaRepository<Match, Long> {

    /** Pending proposals where the user hasn't responded yet */
    @Query("SELECT m FROM Match m WHERE m.status = 'PENDING' AND " +
           "((m.user1 = :user AND m.user1Accepted IS NULL) OR " +
           " (m.user2 = :user AND m.user2Accepted IS NULL))")
    List<Match> findPendingForUser(@Param("user") User user);

    /** Confirmed outings for a user */
    @Query("SELECT m FROM Match m WHERE m.status = 'CONFIRMED' AND " +
           "(m.user1 = :user OR m.user2 = :user) ORDER BY m.event.date ASC")
    List<Match> findConfirmedForUser(@Param("user") User user);

    /** Check if a non-rejected match already exists between two users for an event */
    @Query("SELECT COUNT(m) > 0 FROM Match m WHERE m.event = :event AND m.status <> 'REJECTED' AND " +
           "((m.user1 = :u1 AND m.user2 = :u2) OR (m.user1 = :u2 AND m.user2 = :u1))")
    boolean existsActiveMatchBetween(@Param("event") Event event,
                                     @Param("u1") User u1,
                                     @Param("u2") User u2);

    /** Count confirmed matches received today for a user (daily quota) */
    @Query("SELECT COUNT(m) FROM Match m WHERE (m.user1 = :user OR m.user2 = :user) " +
           "AND m.status = 'PENDING' AND m.createdAt >= :startOfDay")
    long countTodayMatchesForUser(@Param("user") User user, @Param("startOfDay") LocalDateTime startOfDay);
}
