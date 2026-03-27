package com.kulto.domain;

public enum MatchStatus {
    PENDING,       // neither has responded
    CONFIRMED,     // both accepted
    REJECTED,      // at least one rejected
    EXPIRED        // passed expiry without response
}
