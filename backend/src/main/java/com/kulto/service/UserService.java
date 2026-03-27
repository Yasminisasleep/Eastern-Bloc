package com.kulto.service;

import com.kulto.domain.User;
import com.kulto.dto.UserProfileRequest;
import com.kulto.dto.UserProfileResponse;
import com.kulto.exception.ResourceNotFoundException;
import com.kulto.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    public UserProfileResponse getProfile(String email) {
        return AuthService.toProfileResponse(getByEmail(email));
    }

    public UserProfileResponse updateProfile(String email, UserProfileRequest request) {
        User user = getByEmail(email);
        if (request.getDisplayName() != null) user.setDisplayName(request.getDisplayName());
        if (request.getPhotoUrl() != null) user.setPhotoUrl(request.getPhotoUrl());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getPreferredCategories() != null) user.setPreferredCategories(request.getPreferredCategories());
        if (request.getTasteTags() != null) user.setTasteTags(request.getTasteTags());
        return AuthService.toProfileResponse(userRepository.save(user));
    }
}
