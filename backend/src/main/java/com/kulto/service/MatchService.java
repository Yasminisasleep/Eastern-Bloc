package com.kulto.service;

import com.kulto.domain.*;
import com.kulto.dto.MatchEventResponse;
import com.kulto.dto.MatchResponse;
import com.kulto.exception.ResourceNotFoundException;
import com.kulto.repository.MatchRepository;
import com.kulto.repository.PreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MatchService {

    private final MatchRepository matchRepository;
    private final PreferenceRepository preferenceRepository;
    private final NotificationService notificationService;

    public MatchResponse getMatch(Long matchId, Long requestingUserId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));
        return toResponse(match, requestingUserId);
    }

    public MatchResponse acceptMatch(Long matchId, Long requestingUserId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        if (match.getStatus() != MatchStatus.PENDING) {
            throw new IllegalStateException("Match is not in PENDING status");
        }

        boolean isUserOne = match.getUserOne().getId().equals(requestingUserId);
        if (isUserOne) {
            match.setUserOneAccepted(true);
        } else {
            match.setUserTwoAccepted(true);
        }

        if (match.isUserOneAccepted() && match.isUserTwoAccepted()) {
            match.setStatus(MatchStatus.ACCEPTED);
            notificationService.createMatchAcceptedNotification(match);
        }

        matchRepository.save(match);
        return toResponse(match, requestingUserId);
    }

    public MatchResponse rejectMatch(Long matchId, Long requestingUserId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        if (match.getStatus() != MatchStatus.PENDING) {
            throw new IllegalStateException("Match is not in PENDING status");
        }

        match.setStatus(MatchStatus.REJECTED);
        matchRepository.save(match);
        return toResponse(match, requestingUserId);
    }

    MatchResponse toResponse(Match match, Long requestingUserId) {
        User matchedUser = match.getUserOne().getId().equals(requestingUserId)
                ? match.getUserTwo() : match.getUserOne();

        List<String> matchedUserTags = preferenceRepository.findByUserId(matchedUser.getId())
                .map(p -> p.getInterestTags())
                .orElse(Collections.emptyList());

        MatchEventResponse eventResponse = null;
        if (match.getEvent() != null) {
            Event event = match.getEvent();
            eventResponse = MatchEventResponse.builder()
                    .id(event.getId())
                    .title(event.getTitle())
                    .category(event.getCategory().name())
                    .date(event.getDate().toString())
                    .city(event.getCity())
                    .venue(event.getVenue())
                    .build();
        }

        String responseStatus;
        boolean bothAccepted = match.getStatus() == MatchStatus.ACCEPTED;
        if (match.getStatus() == MatchStatus.REJECTED || match.getStatus() == MatchStatus.CANCELLED) {
            responseStatus = match.getStatus().name();
        } else if (bothAccepted) {
            responseStatus = MatchStatus.CONFIRMED.name();
        } else {
            boolean isUserOne = match.getUserOne().getId().equals(requestingUserId);
            boolean myAccepted = isUserOne ? match.isUserOneAccepted() : match.isUserTwoAccepted();
            responseStatus = myAccepted ? MatchStatus.ACCEPTED.name() : MatchStatus.PENDING.name();
        }

        return MatchResponse.builder()
                .id(match.getId())
                .status(responseStatus)
                .compatibilityScore(match.getCompatibilityScore())
                .matchedUserName(matchedUser.getDisplayName())
                .matchedUserBio(matchedUser.getBio())
                .matchedUserCity(matchedUser.getCity())
                .matchedUserTags(matchedUserTags)
                .matchedUserContactLink(bothAccepted ? matchedUser.getContactLink() : null)
                .event(eventResponse)
                .build();
    }
}
