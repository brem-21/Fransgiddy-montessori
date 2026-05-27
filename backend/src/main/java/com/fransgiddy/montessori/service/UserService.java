package com.fransgiddy.montessori.service;

import com.fransgiddy.montessori.entity.User;
import com.fransgiddy.montessori.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> Map.<String, Object>of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole().name(),
                        "active", user.isActive(),
                        "createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : ""
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> toggleUserActive(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setActive(!user.isActive());
        user = userRepository.save(user);

        return Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "active", user.isActive()
        );
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
}
