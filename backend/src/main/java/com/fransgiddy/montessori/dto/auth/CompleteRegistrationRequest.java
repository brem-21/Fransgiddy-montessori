package com.fransgiddy.montessori.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompleteRegistrationRequest(
        @NotBlank(message = "Token is required") String token,
        @NotBlank(message = "Name is required") String name,
        @NotBlank(message = "Password is required") @Size(min = 8, message = "Password must be at least 8 characters") String password
) {}
