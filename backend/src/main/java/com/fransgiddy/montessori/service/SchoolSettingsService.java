package com.fransgiddy.montessori.service;

import com.fransgiddy.montessori.entity.SchoolSettings;
import com.fransgiddy.montessori.repository.SchoolSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SchoolSettingsService {

    private static final Set<String> SENSITIVE_KEYS = Set.of("mnotify.api.key");
    private static final String MASKED_PLACEHOLDER = "***configured***";

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
                .collect(Collectors.toMap(
                        SchoolSettings::getKey,
                        s -> {
                            if (SENSITIVE_KEYS.contains(s.getKey())
                                    && s.getValue() != null && !s.getValue().isBlank()) {
                                return MASKED_PLACEHOLDER;
                            }
                            return s.getValue() == null ? "" : s.getValue();
                        }
                ));
    }

    public void saveAll(Map<String, String> entries) {
        entries.forEach((key, value) -> {
            // Skip the masked placeholder — user did not change this sensitive key
            if (SENSITIVE_KEYS.contains(key) && MASKED_PLACEHOLDER.equals(value)) return;
            set(key, value);
        });
    }
}
