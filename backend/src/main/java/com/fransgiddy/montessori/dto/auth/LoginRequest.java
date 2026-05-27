package com.fransgiddy.montessori.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Phone number is required") String phone,
        @NotBlank(message = "Password is required") String password
) {}
