package com.kulto.dto;

import com.kulto.domain.EventCategory;
import lombok.Data;

import java.util.List;

@Data
public class UserProfileRequest {
    private String displayName;
    private String photoUrl;
    private String bio;
    private String city;
    private List<EventCategory> preferredCategories;
    private List<String> tasteTags;
}
