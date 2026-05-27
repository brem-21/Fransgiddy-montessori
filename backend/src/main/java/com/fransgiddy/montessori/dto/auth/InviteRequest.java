package com.fransgiddy.montessori.dto.auth;

import com.fransgiddy.montessori.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InviteRequest(
        @NotBlank(message = "Email is required") @Email(message = "Must be a valid email") String email,
        @NotNull(message = "Role is required") Role role,
        @NotBlank(message = "Name is required") String name
) {}
