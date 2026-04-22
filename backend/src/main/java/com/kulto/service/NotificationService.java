package com.kulto.service;

import com.kulto.domain.Match;
import com.kulto.domain.Notification;
import com.kulto.domain.NotificationStatus;
import com.kulto.domain.User;
import com.kulto.dto.*;
import com.kulto.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<NotificationResponse> getNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public void createMatchNotification(Match match) {
        createNotificationForUser(match.getUserOne(), match,
                "New match with " + match.getUserTwo().getDisplayName() + "!");
        createNotificationForUser(match.getUserTwo(), match,
                "New match with " + match.getUserOne().getDisplayName() + "!");
    }

    public void createMatchAcceptedNotification(Match match) {
        User u1 = match.getUserOne();
        User u2 = match.getUserTwo();
        createNotificationForUser(u1, match, "Match confirmed with " + u2.getDisplayName() + "! Open the match to see contact details.");
        createNotificationForUser(u2, match, "Match confirmed with " + u1.getDisplayName() + "! Open the match to see contact details.");
    }

    private void createNotificationForUser(User user, Match match, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .match(match)
                .message(message)
                .status(NotificationStatus.UNREAD)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);
    }

    private NotificationResponse toResponse(Notification notification) {
        Match match = notification.getMatch();
        User matchedUser = match.getUserOne().getId().equals(notification.getUser().getId())
                ? match.getUserTwo() : match.getUserOne();

        MatchEventResponse eventResponse = null;
        if (match.getEvent() != null) {
            eventResponse = MatchEventResponse.builder()
                    .id(match.getEvent().getId())
                    .title(match.getEvent().getTitle())
                    .category(match.getEvent().getCategory().name())
                    .date(match.getEvent().getDate().toString())
                    .city(match.getEvent().getCity())
                    .venue(match.getEvent().getVenue())
                    .build();
        }

        MatchSummaryResponse matchSummary = MatchSummaryResponse.builder()
                .id(match.getId())
                .status(match.getStatus().name())
                .compatibilityScore(match.getCompatibilityScore())
                .matchedUserName(matchedUser.getDisplayName())
                .event(eventResponse)
                .build();

        return NotificationResponse.builder()
                .id(notification.getId())
                .status(notification.getStatus().name())
                .createdAt(notification.getCreatedAt().toString())
                .message(notification.getMessage())
                .match(matchSummary)
                .build();
    }
}
