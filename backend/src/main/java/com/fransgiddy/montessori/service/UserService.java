package com.fransgiddy.montessori.service;

import com.fransgiddy.montessori.dto.user.CreateTeacherRequest;
import com.fransgiddy.montessori.entity.User;
import com.fransgiddy.montessori.enums.Role;
import com.fransgiddy.montessori.excel.ExcelUtil;
import com.fransgiddy.montessori.excel.ImportMode;
import com.fransgiddy.montessori.excel.ImportResult;
import com.fransgiddy.montessori.excel.ImportRowError;
import com.fransgiddy.montessori.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
        result.put("active", user.isActive());
        return result;
    }

    @Transactional
    public Map<String, Object> createTeacher(CreateTeacherRequest request) {
        if (userRepository.existsByPhone(request.phone())) {
            throw new RuntimeException("A user with this phone number already exists.");
        }

        User user = User.builder()
                .name(Jsoup.clean(request.name(), Safelist.none()))
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

    private static final String[] IMPORT_HEADERS = {"Name", "Phone", "Password"};

    public byte[] generateTemplate() {
        return ExcelUtil.buildTemplate("Teachers", IMPORT_HEADERS,
                new String[]{"Jane Mensah", "0244123456", "changeme123"});
    }

    @Transactional
    public ImportResult importFromExcel(MultipartFile file, ImportMode mode) throws IOException {
        List<Map<String, String>> rows = ExcelUtil.readRows(file);
        int created = 0, updated = 0, skipped = 0;
        List<ImportRowError> errors = new ArrayList<>();

        for (int i = 0; i < rows.size(); i++) {
            int rowNum = i + 2;
            Map<String, String> row = rows.get(i);
            try {
                String name = Jsoup.clean(required(row, "Name"), Safelist.none());
                String phone = required(row, "Phone");
                String password = row.getOrDefault("Password", "");

                Optional<User> existing = userRepository.findByPhone(phone);
                if (existing.isPresent()) {
                    if (mode == ImportMode.SKIP_DUPLICATES) {
                        skipped++;
                        continue;
                    }
                    User user = existing.get();
                    user.setName(name);
                    if (!password.isBlank()) {
                        user.setPasswordHash(passwordEncoder.encode(password));
                    }
                    userRepository.save(user);
                    updated++;
                } else {
                    if (password.isBlank()) {
                        throw new IllegalArgumentException("\"Password\" is required for new teachers");
                    }
                    User user = User.builder()
                            .name(name)
                            .phone(phone)
                            .passwordHash(passwordEncoder.encode(password))
                            .role(Role.TEACHER)
                            .active(true)
                            .build();
                    userRepository.save(user);
                    created++;
                }
            } catch (Exception e) {
                errors.add(new ImportRowError(rowNum, e.getMessage()));
            }
        }
        return new ImportResult(created, updated, skipped, errors);
    }

    private static String required(Map<String, String> row, String key) {
        String value = row.get(key);
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("\"" + key + "\" is required");
        }
        return value;
    }
}
