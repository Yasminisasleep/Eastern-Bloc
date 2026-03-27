package com.kulto.repository;

import com.kulto.domain.Event;
import com.kulto.domain.EventInterest;
import com.kulto.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EventInterestRepository extends JpaRepository<EventInterest, Long> {

    Optional<EventInterest> findByUserAndEvent(User user, Event event);

    boolean existsByUserAndEvent(User user, Event event);

    long countByEvent(Event event);

    /** All users who expressed interest in an event, excluding a given user */
    @Query("SELECT ei FROM EventInterest ei WHERE ei.event = :event AND ei.user <> :excludeUser")
    List<EventInterest> findByEventExcludingUser(@Param("event") Event event,
                                                 @Param("excludeUser") User excludeUser);

    void deleteByUserAndEvent(User user, Event event);
}
