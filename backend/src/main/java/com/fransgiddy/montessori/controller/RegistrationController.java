package com.fransgiddy.montessori.controller;

import com.fransgiddy.montessori.dto.ApiResponse;
import com.fransgiddy.montessori.dto.registration.RegistrationRequest;
import com.fransgiddy.montessori.entity.Registration;
import com.fransgiddy.montessori.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping("/api/public/registrations")
    public ResponseEntity<ApiResponse<Registration>> submitRegistration(
            @Valid @RequestBody RegistrationRequest request) {
        Registration registration = registrationService.submit(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of("Registration submitted successfully", registration));
    }

    @GetMapping("/api/admin/registrations")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<Registration>>> getAllRegistrations() {
        List<Registration> registrations = registrationService.getAll();
        return ResponseEntity.ok(ApiResponse.of("Registrations retrieved successfully", registrations));
    }

    @PatchMapping("/api/admin/registrations/{id}/status")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Registration>> updateRegistrationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            throw new RuntimeException("Status is required.");
        }
        Registration registration = registrationService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.of("Registration status updated", registration));
    }
}
