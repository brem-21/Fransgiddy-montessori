package com.fransgiddy.montessori.dto.auth;

import com.fransgiddy.montessori.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InviteRequest(
        @NotBlank(message = "Phone number is required") String phone,
        @NotNull(message = "Role is required") Role role,
        @NotBlank(message = "Name is required") String name
) {}
