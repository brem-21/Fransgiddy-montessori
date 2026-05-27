package com.fransgiddy.montessori.service;

import com.fransgiddy.montessori.dto.user.CreateTeacherRequest;
import com.fransgiddy.montessori.entity.User;
import com.fransgiddy.montessori.enums.Role;
import com.fransgiddy.montessori.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", user.getId());
                    m.put("name", user.getName());
                    m.put("phone", user.getPhone());
                    m.put("role", user.getRole().name());
                    m.put("active", user.isActive());
                    m.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
                    return m;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> toggleUserActive(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setActive(!user.isActive());
        user = userRepository.save(user);

        Map<String, Object> result = new HashMap<>();
        result.put("id", user.getId());
        result.put("name", user.getName());
        result.put("phone", user.getPhone());
        result.put("email", user.getEmail() != null ? user.getEmail() : "");
        result.put("active", user.isActive());
        return result;
    }

    @Transactional
    public Map<String, Object> createTeacher(CreateTeacherRequest request) {
        if (userRepository.existsByPhone(request.phone())) {
            throw new RuntimeException("A user with this phone number already exists.");
        }

        User user = User.builder()
                .name(request.name())
                .phone(request.phone())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.TEACHER)
                .active(true)
                .build();

        user = userRepository.save(user);

        Map<String, Object> result = new HashMap<>();
        result.put("id", user.getId());
        result.put("name", user.getName());
        result.put("phone", user.getPhone());
        result.put("role", user.getRole().name());
        result.put("active", user.isActive());
        result.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
        return result;
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
}
