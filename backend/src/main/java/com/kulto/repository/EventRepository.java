package com.kulto.repository;

import com.kulto.domain.Event;
import com.kulto.domain.EventCategory;
import com.kulto.domain.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("SELECT e FROM Event e WHERE e.status = :status AND e.date > :now " +
           "AND (:category IS NULL OR e.category = :category) " +
           "AND (:city IS NULL OR e.city = :city) " +
           "AND (:from IS NULL OR e.date >= :from) " +
           "AND (:to IS NULL OR e.date <= :to) " +
           "AND (:q IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Event> findFiltered(
            @Param("status") EventStatus status,
            @Param("now") LocalDateTime now,
            @Param("category") EventCategory category,
            @Param("city") String city,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("q") String q,
            Pageable pageable);
}
