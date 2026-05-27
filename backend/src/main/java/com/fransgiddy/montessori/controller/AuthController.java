package com.fransgiddy.montessori.controller;

import com.fransgiddy.montessori.dto.ApiResponse;
import com.fransgiddy.montessori.dto.auth.CompleteRegistrationRequest;
import com.fransgiddy.montessori.dto.auth.InviteRequest;
import com.fransgiddy.montessori.dto.auth.LoginRequest;
import com.fransgiddy.montessori.dto.auth.LoginResponse;
import com.fransgiddy.montessori.entity.User;
import com.fransgiddy.montessori.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.of("Login successful", response));
    }

    @PostMapping("/invite")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> inviteUser(
            @Valid @RequestBody InviteRequest request,
            @AuthenticationPrincipal User currentUser) {
        authService.inviteUser(request, currentUser);
        return ResponseEntity.ok(ApiResponse.of("Invite sent successfully", null));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> completeRegistration(
            @Valid @RequestBody CompleteRegistrationRequest request) {
        authService.completeRegistration(request);
        return ResponseEntity.ok(ApiResponse.of("Registration completed successfully", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Object>> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        Object userInfo = authService.getCurrentUser(currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.of("User info retrieved", userInfo));
    }
}
