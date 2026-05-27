package com.fransgiddy.montessori.dto.auth;

public record LoginResponse(
        String token,
        String name,
        String email,
        String role
) {}
