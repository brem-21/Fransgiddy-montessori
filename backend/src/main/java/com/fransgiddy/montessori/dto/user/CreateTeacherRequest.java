package com.fransgiddy.montessori.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTeacherRequest(
        @NotBlank(message = "Name is required") String name,
        @NotBlank(message = "Phone number is required") String phone,
        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters") String password
) {}
