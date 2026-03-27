package com.kulto.dto;

import com.kulto.domain.EventCategory;
import com.kulto.domain.UserRole;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class UserProfileResponse {
    private Long id;
    private String email;
    private String displayName;
    private String photoUrl;
    private String bio;
    private String city;
    private UserRole role;
    private List<EventCategory> preferredCategories;
    private List<String> tasteTags;
}
