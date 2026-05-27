package com.fransgiddy.montessori.controller;

import com.fransgiddy.montessori.dto.ApiResponse;
import com.fransgiddy.montessori.service.SchoolSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
@PreAuthorize("hasRole('PRINCIPAL')")
@RequiredArgsConstructor
public class SchoolSettingsController {

    private final SchoolSettingsService settingsService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> getAll() {
        return ResponseEntity.ok(ApiResponse.of("Settings", settingsService.getAll()));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> saveAll(
            @RequestBody Map<String, String> entries) {
        settingsService.saveAll(entries);
        return ResponseEntity.ok(ApiResponse.of("Settings saved", settingsService.getAll()));
    }
}
