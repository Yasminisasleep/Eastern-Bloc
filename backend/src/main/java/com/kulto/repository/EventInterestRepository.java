package com.kulto.repository;

import com.kulto.domain.EventInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EventInterestRepository extends JpaRepository<EventInterest, Long> {

    @Query("SELECT ei FROM EventInterest ei WHERE ei.user.id = :userId AND ei.event.id = :eventId")
    Optional<EventInterest> findByUserAndEvent(@Param("userId") Long userId, @Param("eventId") Long eventId);

    @Query("SELECT ei FROM EventInterest ei WHERE ei.event.id = :eventId")
    List<EventInterest> findAllByEventId(@Param("eventId") Long eventId);

    @Query("SELECT COUNT(ei) FROM EventInterest ei WHERE ei.event.id = :eventId")
    long countByEventId(@Param("eventId") Long eventId);
}
