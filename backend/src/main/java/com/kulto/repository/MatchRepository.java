package com.kulto.repository;

import com.kulto.domain.Match;
import com.kulto.domain.MatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MatchRepository extends JpaRepository<Match, Long> {

    @Query("SELECT m FROM Match m WHERE (m.userOne.id = :userId OR m.userTwo.id = :userId) AND m.status = :status")
    List<Match> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") MatchStatus status);

    @Query("SELECT m FROM Match m WHERE m.userOne.id = :userId OR m.userTwo.id = :userId ORDER BY m.createdAt DESC")
    List<Match> findByUserId(@Param("userId") Long userId);

    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Match m " +
           "WHERE ((m.userOne.id = :u1 AND m.userTwo.id = :u2) OR (m.userOne.id = :u2 AND m.userTwo.id = :u1)) " +
           "AND m.status NOT IN (com.kulto.domain.MatchStatus.REJECTED, com.kulto.domain.MatchStatus.CANCELLED)")
    boolean existsActiveMatchBetween(@Param("u1") Long u1, @Param("u2") Long u2);

    @Query("SELECT m FROM Match m " +
           "WHERE ((m.userOne.id = :u1 AND m.userTwo.id = :u2) OR (m.userOne.id = :u2 AND m.userTwo.id = :u1)) " +
           "AND m.status NOT IN (com.kulto.domain.MatchStatus.REJECTED, com.kulto.domain.MatchStatus.CANCELLED) " +
           "ORDER BY m.createdAt DESC")
    List<Match> findActiveMatchesBetween(@Param("u1") Long u1, @Param("u2") Long u2);

    @Modifying
    @Query("UPDATE Match m SET m.status = com.kulto.domain.MatchStatus.CANCELLED " +
           "WHERE (m.userOne.id = :userId OR m.userTwo.id = :userId) " +
           "AND m.status = com.kulto.domain.MatchStatus.PENDING")
    int cancelPendingMatchesForUser(@Param("userId") Long userId);
}
