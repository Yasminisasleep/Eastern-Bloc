package com.kulto.repository;

import com.kulto.domain.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface EventRepository extends JpaRepository<Event, Long> {

    @Query(value = "SELECT * FROM events e WHERE e.status = CAST(:status AS VARCHAR) AND e.date > :now " +
           "AND (CAST(:category AS VARCHAR) IS NULL OR e.category = CAST(:category AS VARCHAR)) " +
           "AND (CAST(:city AS VARCHAR) IS NULL OR e.city = CAST(:city AS VARCHAR)) " +
           "AND (CAST(:fromDate AS TIMESTAMP) IS NULL OR e.date >= CAST(:fromDate AS TIMESTAMP)) " +
           "AND (CAST(:toDate AS TIMESTAMP) IS NULL OR e.date <= CAST(:toDate AS TIMESTAMP)) " +
           "AND (CAST(:q AS VARCHAR) IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', CAST(:q AS VARCHAR), '%')))",
           countQuery = "SELECT COUNT(*) FROM events e WHERE e.status = CAST(:status AS VARCHAR) AND e.date > :now " +
           "AND (CAST(:category AS VARCHAR) IS NULL OR e.category = CAST(:category AS VARCHAR)) " +
           "AND (CAST(:city AS VARCHAR) IS NULL OR e.city = CAST(:city AS VARCHAR)) " +
           "AND (CAST(:fromDate AS TIMESTAMP) IS NULL OR e.date >= CAST(:fromDate AS TIMESTAMP)) " +
           "AND (CAST(:toDate AS TIMESTAMP) IS NULL OR e.date <= CAST(:toDate AS TIMESTAMP)) " +
           "AND (CAST(:q AS VARCHAR) IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', CAST(:q AS VARCHAR), '%')))",
           nativeQuery = true)
    Page<Event> findFiltered(
            @Param("status") String status,
            @Param("now") LocalDateTime now,
            @Param("category") String category,
            @Param("city") String city,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("q") String q,
            Pageable pageable);
}
