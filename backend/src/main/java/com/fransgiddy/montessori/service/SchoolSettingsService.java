package com.fransgiddy.montessori.service;

import com.fransgiddy.montessori.entity.SchoolSettings;
import com.fransgiddy.montessori.repository.SchoolSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SchoolSettingsService {

    private final SchoolSettingsRepository repo;

    public String get(String key) {
        return repo.findById(key).map(SchoolSettings::getValue).orElse(null);
    }

    public String getOrDefault(String key, String defaultValue) {
        String val = get(key);
        return (val != null && !val.isBlank()) ? val : defaultValue;
    }

    public void set(String key, String value) {
        repo.save(SchoolSettings.builder().key(key).value(value).build());
    }

    public Map<String, String> getAll() {
        return repo.findAll().stream()
                .collect(Collectors.toMap(SchoolSettings::getKey, s -> s.getValue() == null ? "" : s.getValue()));
    }

    public void saveAll(Map<String, String> entries) {
        entries.forEach(this::set);
    }
}
